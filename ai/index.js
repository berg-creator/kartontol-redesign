// Облачная функция Яндекса: письмо клиента → поля заявки калькулятора (JSON).
// Ключа нет: IAM-токен даёт сервисный аккаунт функции (context.token).
const PROMPT = `Ты разбираешь письмо клиента картонного завода. Верни только JSON без пояснений:
{"company":"","contact":"телефон или почта","product":"рулон|лист|лента","brand":"","grammageGsm":0,
"size":"ширина рулона в мм или формат листа, например 700 × 1000 мм","qty":0,"unit":"t|roll|sheet",
"city":"","comment":"сроки, упаковка, вопросы"}
Чего нет в письме — пустая строка или 0. Ничего не выдумывай.`;

exports.handler = async (event, context) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json; charset=utf-8' };
  const body = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString() : event.body || '';
  // ponytail: URL функции публичный, расход режут только лимиты длины; нужна защита — капча или ключ сайта
  const letter = body.slice(0, 4000).trim();
  if (!letter) return { statusCode: 400, headers, body: '{"error":"пустое письмо"}' };

  const r = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + context.token.access_token, 'x-folder-id': process.env.FOLDER_ID },
    body: JSON.stringify({
      modelUri: `gpt://${process.env.FOLDER_ID}/yandexgpt-lite/latest`,
      completionOptions: { stream: false, temperature: 0, maxTokens: '500' },
      messages: [{ role: 'system', text: PROMPT }, { role: 'user', text: letter }],
    }),
  });
  const data = await r.json();
  if (!r.ok) return { statusCode: 502, headers, body: JSON.stringify({ error: data.error?.message || r.status }) };
  const text = data.result.alternatives[0].message.text;
  const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  try { JSON.parse(json); } catch { return { statusCode: 502, headers, body: JSON.stringify({ error: 'не JSON', text }) }; }
  return { statusCode: 200, headers, body: json };
};
