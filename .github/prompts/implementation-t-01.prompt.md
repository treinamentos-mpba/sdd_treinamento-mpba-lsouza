---
mode: agent
description: 'Implementa T-01: contratos TypeScript do domínio Weather App.'
---

# Implementação — T-01: Definir os tipos de domínio

Você é o Code Agent. Implemente somente T-01 do backlog. Este prompt contém o contexto e os critérios necessários para executar a tarefa sem depender de instruções adicionais no chat.

## Contexto

O Weather App é uma aplicação React/Vite em TypeScript strict. A V1 consulta Open-Meteo sem autenticação nem persistência. A camada de domínio deve ser normalizada e independente de React, rede e payloads externos. Nomes de tipos e propriedades são en-US; comentários de código são pt-BR.

Temperaturas meteorológicas são armazenadas em Celsius. Campos que a Open-Meteo pode omitir são opcionais; ausência não significa zero. A previsão diária deve ser representada por cinco datas locais, mas o tipo permanece um array simples: a normalização posterior garante o número de entradas e cria placeholders por data, sem codificar uma tupla rígida.

## Escopo

Criar ou atualizar somente `src/types/weather.ts`. Não implementar serviços, mapeadores, conversões, componentes, hooks, persistência ou lógica de runtime. Não adicionar dependências. Não criar teste unitário apenas para declarações de tipos; a validação é feita pelo TypeScript e pelos comandos do projeto.

## Contrato esperado

Exportar os seguintes tipos e propriedades:

```ts
export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  region?: string;
  country?: string;
  timezone?: string;
}

export interface CurrentWeather {
  temperatureC?: number;
  apparentTemperatureC?: number;
  relativeHumidityPercent?: number;
  weatherCode?: number;
  observedAt?: string;
}

export interface ForecastDay {
  date: string;
  weatherCode?: number;
  temperatureMinC?: number;
  temperatureMaxC?: number;
  precipitationProbabilityMaxPercent?: number;
}

export interface WeatherData {
  city: City;
  timezone: string;
  current?: CurrentWeather;
  forecast: ForecastDay[];
}

export type WeatherErrorKind =
  | 'network'
  | 'api'
  | 'timeout'
  | 'invalid-response';

export interface WeatherError {
  kind: WeatherErrorKind;
  retryable: boolean;
}
```

Inclua comentários curtos em pt-BR explicando cada propriedade e a unidade/formato dos valores. `date` usa `YYYY-MM-DD` no calendário local da cidade; `observedAt` preserva o horário informado pela fonte; `weatherCode` é o código WMO, não um rótulo textual. Mantenha nomes e opcionabilidade conforme o contrato acima.

## Critérios de aceite

1. `src/types/weather.ts` exporta exatamente os contratos e membros listados, sem `any`.
2. Todas as propriedades têm comentários curtos em pt-BR; temperaturas indicam graus Celsius, umidade/probabilidade indicam porcentagem e datas/horários indicam seus formatos/fuso.
3. Campos opcionais permanecem opcionais; não são tipados como `number` com zero padrão nem como campos obrigatórios quando a API pode omiti-los.
4. `WeatherData.forecast` usa `ForecastDay[]`, com a regra de cinco datas documentada, sem tupla fixa ou abstração genérica adicional.
5. Nenhum arquivo fora de `src/types/weather.ts` é alterado e nenhum comportamento de runtime é implementado.

## Validação

Após a alteração, executar `pnpm lint`, `pnpm build` e `pnpm test`, conforme as instruções do projeto para mudanças em `src/`. Corrigir falhas introduzidas pela tarefa; não ampliar o escopo para corrigir problemas preexistentes não relacionados.

## Relato final

Informar o arquivo alterado, os tipos exportados e os comandos executados, indicando claramente qualquer validação que não tenha sido possível concluir.