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

async function mockWeatherApi(page: Page, failFirstGeocoding = false) {
  let geocodingRequests = 0;
  let forecastRequests = 0;

  await page.route('**/v1/search**', async (route) => {
    geocodingRequests += 1;
    if (failFirstGeocoding && geocodingRequests === 1) {
      await route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
      return;
    }

    const name = new URL(route.request().url()).searchParams.get('name');
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ results: name?.toLowerCase() === 'recife' ? [city] : [] }),
    });
  });

  await page.route('**/v1/forecast**', async (route) => {
    forecastRequests += 1;
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
          temperature_2m: 27,
          apparent_temperature: 29,
          relative_humidity_2m: 74,
          weather_code: 2,
          wind_speed_10m: 14,
          precipitation: 0.2,
          surface_pressure: 1012,
        },
        daily: {
          time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
          weather_code: [2, 3, 61, 1, 0],
          temperature_2m_min: [23, 23, 22, 23, 24],
          temperature_2m_max: [29, 28, 27, 29, 30],
          precipitation_probability_max: [20, 35, 70, 10, 5],
        },
      }),
    });
  });

  return () => forecastRequests;
}

test('completes search, forecast, and unit toggle at 320px without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 760 });
  const forecastRequestCount = await mockWeatherApi(page);
  await page.goto('/');

  const search = page.getByRole('searchbox', { name: 'Buscar cidade' });
  await search.fill('Recife');
  await search.press('Enter');

  const cityResult = page.getByRole('button', { name: /Recife.*Pernambuco.*Brasil/ });
  await expect(cityResult).toBeVisible();
  await cityResult.click();
  await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  await expect(forecast).toBeVisible();
  await expect(forecast.getByRole('listitem')).toHaveCount(5);
  expect(forecastRequestCount()).toBe(1);
  await page
    .getByRole('group', { name: 'Unidade de temperatura' })
    .getByRole('button', { name: '°F' })
    .click();
  await expect(page.getByRole('group', { name: 'Temperatura: 81 °F' })).toBeVisible();
  expect(forecastRequestCount()).toBe(1);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test('announces service errors and retries the last search with keyboard focus preserved', async ({
  page,
}) => {
  await mockWeatherApi(page, true);
  await page.goto('/');

  const search = page.getByRole('searchbox', { name: 'Buscar cidade' });
  await search.fill('Recife');
  await search.press('Enter');

  await expect(page.getByRole('alert')).toContainText('Falha ao buscar cidades.');
  await page.getByRole('button', { name: 'Tentar novamente' }).focus();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByRole('button', { name: /Recife.*Pernambuco.*Brasil/ })).toBeVisible();
  await page.getByRole('button', { name: /Recife.*Pernambuco.*Brasil/ }).click();
  await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
});
