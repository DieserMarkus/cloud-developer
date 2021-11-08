import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { TodoUtils } from '../../helpers/todoUtils'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const logger = createLogger('UpdateTodos')
const todoUtils = new TodoUtils();

// DONE
// Update a TODO item with the provided id using values in the "updatedTodo" object
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const userId = getUserId(event)
    const itemId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

    logger.info('Updating todo item', {userId, itemId})

    await todoUtils.updateTodo(userId, itemId, updatedTodo)

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
