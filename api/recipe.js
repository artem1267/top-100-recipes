export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dishName } = req.body;
  const apiKey = process.env.apikey; // Це та змінна, яку ти щойно зберіг на Vercel!

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured on server' });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Напиши детальний рецепт приготування страви: ${dishName}. Відповідь надай виключно українською мовою у форматі JSON з полями: description (цікавий опис), prepTime (час приготування, наприклад "45 хв"), difficulty (складність), ingredients (масив рядків з інгредієнтами та кількістю), instructions (масив рядків з покроковими кроками приготування). Поверни ТІЛЬКИ валідний JSON без жодних додаткових символів чи markdown-обгорток (без \`\`\`json).` }]
        }]
      })
    });

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const recipe = JSON.parse(cleanJson);

    return res.status(200).json(recipe);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate recipe from AI' });
  }
}
