const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/adif/station', async (req, res) => {
  const { stationId } = req.query;
  
  if (!stationId) {
    return res.status(400).json({ 
      success: false, 
      error: 'stationId es requerido' 
    });
  }

  try {
    console.log(`Obteniendo datos para estación: ${stationId}`);
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto(`https://info.adif.es/?s=${stationId}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    const html = await page.content();
    await browser.close();

    console.log(`HTML obtenido correctamente (${html.length} caracteres)`);

    res.json({
      success: true,
      stationId,
      rawHtml: html,
      note: 'HTML obtenido con Puppeteer desde Render'
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      stationId
    });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'Backend ADIF funcionando correctamente' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend ADIF corriendo en puerto ${PORT}`);
});