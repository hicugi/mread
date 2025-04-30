const clients = {};

const sendMessage = (res, data) => {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}
export const activeConnect = (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    "Transfer-Encoding": "chunked",
  });
  res.flushHeaders();

  sendMessage(res, { message: "connected" });

  const clientId = Date.now();
  clients[clientId] = res;

  req.on('close', () => {
    delete clients[clientId];
  });

  return (data) => sendMessage(res, data);
}
