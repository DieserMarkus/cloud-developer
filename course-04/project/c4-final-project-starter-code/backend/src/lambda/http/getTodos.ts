import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils';
import { TodoUtils } from '../../helpers/todoUtils'

const logger = createLogger('GetTodos')
const todoUtils = new TodoUtils();

// DONE
// Get all todo items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const userId = getUserId(event)
    const items = await todoUtils.getTodosForUser(userId)

    logger.info('Getting todo items', {userId})

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items
      })
  }
})

handler
 .use(httpErrorHandler())
 .use(
     cors({
       credentials: true
  })
)