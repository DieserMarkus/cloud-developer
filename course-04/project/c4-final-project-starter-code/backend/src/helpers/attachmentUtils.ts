import * as AWS from 'aws-sdk'

const bucketName = process.env.ATTACHMENT_S3_BUCKET;

// DONE 
// Implement the fileStorage logic
export class AttachmentUtils {
    constructor(
        private readonly dynamoDBClient: AWS.DynamoDB.DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
    ){}

    async updateTodoAttachmentUrl(userId: string, itemId: string, attachmentUrl: string){

        await this.dynamoDBClient.update({
            TableName: this.todosTable,
            Key: {
                'todoId' : itemId,
                'userId' : userId
            },
            UpdateExpression: "set attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": `https://${bucketName}.s3.amazonaws.com/${attachmentUrl}`
            }
        }).promise();
    }
}