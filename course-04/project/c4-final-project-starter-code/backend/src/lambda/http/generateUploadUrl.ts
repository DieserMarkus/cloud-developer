import 'source-map-support/register'
import * as uuid from 'uuid';
import * as AWS from 'aws-sdk';
import * as AWSXRay from "aws-xray-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { AttachmentUtils } from '../../helpers/AttachmentUtils'
import { getUserId } from '../utils'

const logger = createLogger('GenerateUploadURL')
const attachmentUtils = new AttachmentUtils()
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({signatureVersion: 'v4'})

// DONE
// Return a presigned URL to upload a file for a TODO item with the provided id
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const attachmentId = uuid()
    const userId = getUserId(event)
    const itemId = event.pathParameters.todoId

    logger.info('Generating attachment URL', {userId, itemId})

    const url = s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: attachmentId,
      Expires: parseInt(urlExpiration)
    });

    await attachmentUtils.updateTodoAttachmentUrl(userId, itemId, attachmentId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        uploadUrl: url
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
