#!/bin/bash
DIR="/opt/goinfre/rrangesi/telegram-grocery"
NPX="/opt/goinfre/rrangesi/apps/node/bin/npx"

fuser -k 3000/tcp 5173/tcp 2>/dev/null
sleep 1

$NPX tsx $DIR/backend/src/index.ts &
sleep 3

cd $DIR/frontend
$NPX vite --host 0.0.0.0 --port 5173 &
sleep 3

echo ""
echo "✅ Backend: http://localhost:3000"
echo "✅ Frontend: http://localhost:5173"
echo ""
