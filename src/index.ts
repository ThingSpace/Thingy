import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { moderationWorker } from './moderation/worker'
import { logsRoute } from './routes/logs'
import { stateRoute } from './routes/state'
import { authRoute } from './routes/auth'
import { moderationAdminRoute, resultRoute } from './routes/result'

const app = new Elysia()
    .use(
        swagger({
            path: '/docs',
            documentation: {
                info: {
                    title: 'Thingy',
                    version: '1.0.0',
                    description: 'The thingy thats used for moderating A Thing.'
                }
            }
        })
    )
    .use(moderationWorker())
    .use(stateRoute)
    // Routes below here require an api token
    .use(authRoute)
    .use(logsRoute)
    .use(resultRoute)
    .listen(process.env.PORT)

console.log('Elysia API server started on port 3000')
