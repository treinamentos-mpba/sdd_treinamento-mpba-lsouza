import { expect, type Page, test } from '@playwright/test';

const city = {
  id: 3390760,
  name: 'Recife',
  latitude: -8.0539,
  longitude: -34.8811,
  admin1: 'Pernambuco',
  country: 'Brasil',
  timezone: 'America/Recife',
};

async function mockForecastApi(page: Page) {
  await page.route('**/v1/search**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ results: [city] }),
    });
  });

  await page.route('**/v1/forecast**', async (route) => {
    const requestUrl = new URL(route.request().url());
    expect(requestUrl.searchParams.get('latitude')).toBe(String(city.latitude));
    expect(requestUrl.searchParams.get('longitude')).toBe(String(city.longitude));
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        timezone: 'America/Recife',
        current_units: {
          time: 'iso8601',
          temperature_2m: '°C',
          apparent_temperature: '°C',
          relative_humidity_2m: '%',
          weather_code: 'wmo code',
          wind_speed_10m: 'km/h',
          precipitation: 'mm',
          surface_pressure: 'hPa',
        },
        daily_units: {
          time: 'iso8601',
          weather_code: 'wmo code',
          temperature_2m_min: '°C',
          temperature_2m_max: '°C',
          precipitation_probability_max: '%',
        },
        current: {
          time: '2026-10-29T12:00',
          temperature_2m: 0,
          apparent_temperature: -1,
          relative_humidity_2m: 70,
          weather_code: 3,
          wind_speed_10m: 10,
          precipitation: 0,
          surface_pressure: 1012,
        },
        daily: {
          time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
          weather_code: [3, 1, 61, 2, 0],
          temperature_2m_min: [-2, 0, 1, 2, 3],
          temperature_2m_max: [0, 2, 3, 4, 5],
          precipitation_probability_max: [0, 10, 70, 20, 5],
        },
      }),
    });
  });
}

test('searches, renders a five-day forecast, and converts 0°C to 32°F', async ({ page }) => {
  await mockForecastApi(page);
  await page.goto('/');

  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Recife');
  await page.getByRole('button', { name: 'Buscar' }).click();

  const cityResult = page.getByRole('button', { name: /Recife.*Pernambuco.*Brasil/ });
  await expect(cityResult).toBeVisible();
  await cityResult.click();
  await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  await expect(forecast).toBeVisible();
  await expect(forecast.getByRole('listitem')).toHaveCount(5);

  await page
    .getByRole('group', { name: 'Unidade de temperatura' })
    .getByRole('button', { name: '°F' })
    .click();
  await expect(page.getByRole('group', { name: 'Temperatura: 32 °F' })).toBeVisible();

  await page.reload();
  expect(await page.evaluate(() => localStorage.length === 0 && sessionStorage.length === 0)).toBe(
    true,
  );
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Recife');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: /Recife.*Pernambuco.*Brasil/ }).click();
  await expect(page.getByRole('group', { name: 'Temperatura: 0 °C' })).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'Unidade de temperatura' }).getByRole('button', { name: '°C' }),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('shows the empty message when geocoding returns no results', async ({ page }) => {
  let forecastRequests = 0;
  await page.route('**/v1/search**', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify({}) }),
  );
  await page.route('**/v1/forecast**', (route) => {
    forecastRequests += 1;
    return route.fulfill({ status: 500, body: '' });
  });
  await page.goto('/');

  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Londres');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('status')).toContainText('Nenhuma cidade encontrada');
  expect(forecastRequests).toBe(0);
});

test('renders the primary weather flow at a 375x812 mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockForecastApi(page);
  await page.goto('/');

  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Recife');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('button', { name: /Recife.*Pernambuco.*Brasil/ })).toBeVisible();
  await page.getByRole('button', { name: /Recife.*Pernambuco.*Brasil/ }).click();
  await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  await expect(forecast).toBeVisible();
  await expect(forecast.getByRole('listitem')).toHaveCount(5);
  await expect(page.getByRole('group', { name: 'Temperatura: 0 °C' })).toBeVisible();

  const documentOverflowsHorizontally = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(documentOverflowsHorizontally).toBe(false);
});
