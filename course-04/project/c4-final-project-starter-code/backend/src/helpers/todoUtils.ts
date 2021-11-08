import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

// const XAWS = AWSXRay.captureAWS(AWS)
const uuid = require('uuid/v4')

// DONE
// Implement the dataLayer logic
export class TodoUtils{

    constructor(
        // Unsure why but I can't use XAWS here
        // private readonly dynamoDBClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly dynamoDBClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly index = process.env.TODOS_CREATED_AT_INDEX
    ) { }

    async createTodo(userId:string, newTodo: CreateTodoRequest): Promise<string>{
        const itemId = uuid()
        const item = {
            userId: userId,
            todoId: itemId,
            ...newTodo
        }
  
        await this.dynamoDBClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise()

        return itemId
    }

    async getTodosForUser(userId:string): Promise<TodoItem[]>{
        const result = await this.dynamoDBClient.query({
            TableName: this.todosTable,
            IndexName: this.index,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId' : userId
            }
        }).promise()
        return result.Items as TodoItem[]
    }

    async updateTodo(userId: string, itemId: string, updatedTodo:UpdateTodoRequest) {
        await this.dynamoDBClient.update({
            TableName: this.todosTable,
            Key: {
                'todoId' : itemId,
                'userId' : userId
            },
            UpdateExpression: 'set #namefield = :n, dueDate = :d, done = :done',
            ExpressionAttributeValues: {
                ':n' : updatedTodo.name,
                ':d' : updatedTodo.dueDate,
                ':done' : updatedTodo.done
            },
            ExpressionAttributeNames:{
                '#namefield' : 'name'
              }
          }).promise()
    }

    async deleteTodo(userId: string, itemId: string) {
        const param = {
            TableName: this.todosTable,
            Key: {
                'todoId' : itemId,
                'userId' : userId
            }
        }
        await this.dynamoDBClient.delete(param).promise()
    }
}