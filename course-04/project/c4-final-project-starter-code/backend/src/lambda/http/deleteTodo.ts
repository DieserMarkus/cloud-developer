import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { TodoUtils } from '../../helpers/todoUtils'

const logger = createLogger('DeleteTodos')
const todoUtils = new TodoUtils();

// DONE 
// Remove a TODO item by id
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const userId = getUserId(event)
    const itemId = event.pathParameters.todoId

    logger.info('Deleting todo item', {userId, itemId})

    await todoUtils.deleteTodo(userId, itemId);

    return {
      statusCode: 202,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({})
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
