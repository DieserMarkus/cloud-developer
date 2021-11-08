import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils';
import { TodoUtils } from '../../helpers/todoUtils'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

const logger = createLogger('CreateTodos')
const todoUtils = new TodoUtils();

// DONE
// Implement creating a new TODO item
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const userId = getUserId(event)
    const newItem: CreateTodoRequest = JSON.parse(event.body)
    const itemId = await todoUtils.createTodo(userId, newItem)

    logger.info('Creating todo item', {userId, itemId})

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item:
            {
              itemId: itemId,
              ...newItem
            }
      })
    };
  })

  handler
  .use(httpErrorHandler())
  .use(
      cors({
        credentials: true
  })
 )