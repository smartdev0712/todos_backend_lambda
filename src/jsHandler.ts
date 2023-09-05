import {
  DynamoDBClient,
  DeleteItemCommandInput,
  DeleteItemCommand,
  PutItemCommandInput,
  PutItemCommand,
  ScanCommandInput,
  ScanCommand,
  UpdateItemCommandInput,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import {
  DeleteEvent,
  GetEvent,
  LambdaCallback,
  LambdaContext,
  PatchEvent,
  PostEvent,
} from "./types/lambdaTypes";
import { CreateBodyType, UpdateBodyType } from "./types/dynamodbTypes";

const dynamodb = new DynamoDBClient({ region: "us-east-1" });

export const getTasks = (
  event: GetEvent,
  context: LambdaContext,
  callback: LambdaCallback
) => {
  console.log("Function Starting...", event);
  const scanParams: ScanCommandInput = {
    TableName: "test-tasks",
    Select: "ALL_ATTRIBUTES",
  };
  dynamodb
    .send(new ScanCommand(scanParams))
    .then((data) => {
      console.log("all tasks", data.Items);
      const response = {
        statusCode: 200,
        body: JSON.stringify(data.Items),
      };
      callback(null, response);
    })
    .catch((err) => {
      console.error(err);
      callback(err, null);
    });
};

export const createTask = (
  event: PostEvent,
  context: LambdaContext,
  callback: LambdaCallback
) => {
  console.log("Function Starting...", event);
  const body: CreateBodyType = JSON.parse(event.body);
  const id: string = uuidv4();
  const newTask: PutItemCommandInput = {
    Item: {
      id: { S: id },
      title: { S: body.title },
      details: { S: body.details },
      created_date: { N: body.created_date.toString() },
      due_date: { N: body.due_date.toString() },
      priority: { S: body.priority },
    },
    TableName: "test-tasks",
  };
  dynamodb
    .send(new PutItemCommand(newTask))
    .then((data) => {
      console.log("successfully update the item");
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: "response for task create",
          input: body,
          output: data,
        }),
      };
      return callback(null, response);
    })
    .catch((err) => {
      console.error(err);
      const response = {
        statusCode: err.statusCode,
        body: JSON.stringify(err),
      };
      return callback(null, response);
    });
};

export const editTask = (
  event: PatchEvent,
  context: LambdaContext,
  callback: LambdaCallback
) => {
  console.log("Function Starting...", event);
  const id: string = event.queryStringParameters.id;
  const body: UpdateBodyType = JSON.parse(event.body);
  const params: UpdateItemCommandInput = {
    TableName: "test-tasks",
    Key: {
      id: { S: id },
    },
    ExpressionAttributeNames: {
      "#T": "title",
      "#D": "details",
      "#N": "due_date",
      "#P": "priority",
    },
    ExpressionAttributeValues: {
      ":t": {
        S: body.title,
      },
      ":d": {
        S: body.details,
      },
      ":n": {
        N: body.due_date.toString(),
      },
      ":p": {
        S: body.priority,
      },
    },
    UpdateExpression: "SET #T = :t, #D = :d, #N = :n, #P = :p",
    ReturnValues: "ALL_NEW",
  };
  dynamodb
    .send(new UpdateItemCommand(params))
    .then((data) => {
      console.log("successfully update the data");
      callback(null, data);
    })
    .catch((err) => {
      console.error(err);
      callback(err, null);
    });
};

export const deleteTask = (
  event: DeleteEvent,
  context: LambdaContext,
  callback: LambdaCallback
) => {
  console.log("Function Starting...", event);
  const id: string = event.queryStringParameters.id;
  const params: DeleteItemCommandInput = {
    Key: {
      id: { S: id },
    },
    TableName: "test-tasks",
  };
  dynamodb
    .send(new DeleteItemCommand(params))
    .then((data) => {
      console.log("item successfully removed");
      callback(null, data);
    })
    .catch((err) => {
      console.error(err);
      callback(err, null);
    });
};
