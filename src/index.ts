import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { moderationWorker } from './moderation/worker'
import { logsRoute } from './routes/logs'
import { stateRoute } from './routes/state'
import { authRoute } from './routes/auth'
import { resultRoute } from './routes/result'

const port = Number(process.env.PORT) || 9422

new Elysia()
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
    .listen(port)

console.log(`Elysia API server started on port ${port}`)
