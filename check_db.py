import asyncio
import asyncpg

async def test():
    print('Connecting...')
    conn = await asyncpg.connect('postgresql://postgres:125364@localhost:5432/test_gh_actions_db')
    print('Connected!')
    result = await conn.fetch('SELECT tablename FROM pg_tables WHERE schemaname = $1', 'public')
    for row in result:
        print(row)
    await conn.close()
    print('Done!')

asyncio.run(test())
