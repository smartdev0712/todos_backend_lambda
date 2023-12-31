import {
  DynamoDBClient,
  DeleteItemCommandInput,
  DeleteItemCommand,
  PutItemCommandInput,
  PutItemCommand,
  QueryCommandInput,
  QueryCommand,
  ScanCommandInput,
  ScanCommand,
  UpdateItemCommandInput,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import {
  GetEvent,
  GetOrDeleteEvent,
  LambdaCallback,
  LambdaContext,
  PatchEvent,
  PostEvent,
} from "./types/lambdaTypes";
import {
  CreateBodyType,
  TaskType,
  UpdateBodyType,
} from "./types/dynamodbTypes";

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
      const results: any = [];
      for (let item of data.Items as unknown as TaskType[]) {
        const newItem = {
          id: item.id?.S,
          title: item.title?.S,
          details: item.details?.S,
          created_date: item.created_date?.N,
          due_date: item.due_date?.N,
          priority: item.priority?.S,
        };
        results.push(newItem);
      }
      console.log("all tasks", results);
      const response = {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(results),
      };
      callback(null, response);
    })
    .catch((err) => {
      console.error(err);
      callback(err, null);
    });
};

export const getTask = (
  event: GetOrDeleteEvent,
  context: LambdaContext,
  callback: LambdaCallback
) => {
  console.log("Function Starting...", event);
  const id = event.pathParameters.id;
  const params: QueryCommandInput = {
    TableName: "test-tasks",
    KeyConditionExpression: "#id = :id",
    ExpressionAttributeNames: { "#id": "id" },
    ExpressionAttributeValues: {
      ":id": { S: id },
    },
  };
  dynamodb
    .send(new QueryCommand(params))
    .then((data) => {
      if (data.Items) {
        const result = data.Items[0] as unknown as TaskType;
        const newItem = {
          id: result.id.S,
          title: result.title.S,
          details: result.details.S,
          created_date: result.created_date.N,
          due_date: result.due_date.N,
          priority: result.priority.S,
        };
        console.log("task for " + id, newItem);
        const response = {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify(newItem),
        };
        callback(null, response);
      } else {
        callback("cannot find the task", null);
      }
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
      console.log("successfully create the item", newTask);
      const response = {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
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
        headers: { "Access-Control-Allow-Origin": "*" },
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
  const id: string = event.pathParameters.id;
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
      const message: string = "successfully update the data for " + id;
      console.log(message);
      const response = {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: message,
      };
      callback(null, response);
    })
    .catch((err) => {
      console.error(err);
      callback(err, null);
    });
};

export const deleteTask = (
  event: GetOrDeleteEvent,
  context: LambdaContext,
  callback: LambdaCallback
) => {
  console.log("Function Starting...", event);
  const id: string = event.pathParameters.id;
  const params: DeleteItemCommandInput = {
    Key: {
      id: { S: id },
    },
    TableName: "test-tasks",
  };
  dynamodb
    .send(new DeleteItemCommand(params))
    .then((data) => {
      const message: string = "item successfully removed for " + id;
      console.log(message);
      const response = {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: message,
      };
      callback(null, response);
    })
    .catch((err) => {
      console.error(err);
      callback(err, null);
    });
};
