# Backlog de Tarefas — Weather App

Derivado de [`plans/weather-app-plan.md`](../plans/weather-app-plan.md) e rastreado aos requisitos de [`specs/weather-app-spec.md`](../specs/weather-app-spec.md). As entregas organizam o trabalho por camada; para obter valor incremental, seguir a sequência de fatias verticais ao final. Dependências são bloqueios: uma tarefa só começa quando todos os IDs listados estiverem concluídos. Cada tarefa tem um único tipo de trabalho e no máximo dois arquivos prováveis.

> **Decisão pendente para reconciliação:** o plano adota timeout de 10 s conforme AC-17/NFR-03, mas a tabela de Edge Cases da spec ainda diz que a duração será definida. Confirmar essa redação com produto antes de fechar os critérios de release; até lá, as tarefas usam 10 s como baseline explícita.

## Entrega 1 — Tipos

### T-01 — Definir os tipos de domínio

- **Descrição:** declarar contratos TypeScript normalizados compartilhados pela UI e pelos serviços.
- **Critérios de aceite:** `src/types/weather.ts` exporta `Unit`, `City`, `CurrentWeather`, `ForecastDay`, `WeatherData` e `WeatherError`; `City` contém nome e coordenadas; campos regionais/meteorológicos que a API pode omitir são opcionais; `ForecastDay.date` usa `YYYY-MM-DD`; `WeatherData.forecast` representa cinco datas locais, permitindo entrada com apenas `date`; temperaturas do modelo usam Celsius.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-02 a FR-06, NFR-04, NFR-05.

## Entrega 2 — Funções puras

### T-02 — Implementar conversões de temperatura

- **Descrição:** criar a função pura que deriva Celsius ou Fahrenheit para apresentação.
- **Critérios de aceite:** com entradas `20`, `-40` e `0.5` °C, a função retorna `68`, `-40` e `33` °F; ao exibir Celsius, arredonda os mesmos valores para `20`, `-40` e `1`; não modifica entradas nem dispara serviço/requisição.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-05, AC-10, AC-11.

### T-03 — Implementar formatação de data, hora e atualidade

- **Descrição:** criar funções puras para datas/horas locais e idade da observação.
- **Critérios de aceite:** fixtures com timezone produzem os formatos `dd/MM/yyyy` e `HH:mm`; idade exatamente de 60 minutos não sinaliza desatualização e idade de 61 minutos sinaliza; sem `observedAt`, resultado é indisponível e não usa hora da consulta.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/dateTime.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-06, FR-07, NFR-05, AC-12, AC-13, AC-21.

### T-04 — Mapear códigos meteorológicos WMO

- **Descrição:** fornecer rótulos pt-BR para os códigos WMO recebidos da API.
- **Critérios de aceite:** código WMO `3` retorna `Nublado`; código válido do catálogo WMO retorna rótulo pt-BR não vazio; código desconhecido retorna indisponibilidade (`undefined`), sem exceção ou descrição inventada.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weatherCode.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-03, FR-04, FR-07, AC-06, AC-08.

### T-05 — Normalizar payloads da Open-Meteo

- **Descrição:** mapear respostas de geocoding e forecast para contratos internos, sem I/O.
- **Critérios de aceite:** geocoding mapeia `id/name/latitude/longitude/admin1/country/timezone` para `City`; forecast mapeia campos atuais e arrays diários por data; saída contém cinco datas locais consecutivas no timezone retornado; array curto gera placeholder com campos ausentes, sem deslocar valores; unidade diferente de Celsius ou estrutura incompatível é rejeitada como resposta inválida.
- **Dependências:** T-01, T-03.
- **Arquivos prováveis:** `src/lib/openMeteoMappers.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-02 a FR-04, FR-06, AC-05, AC-07 a AC-09, AC-18.

## Entrega 3 — Services

### T-06 — Implementar serviço de geocoding

- **Descrição:** encapsular a chamada de busca à Open-Meteo e erros de transporte.
- **Critérios de aceite:** URL usa `name`, `count=5`, `language=pt` e `format=json`; ` Santiago ` envia `Santiago`; após decodificação por `URLSearchParams`, `name` para `São Tomé` permanece exato; seis resultados produzem os cinco primeiros na ordem original; resultados vazios retornam `[]`; timeout encerra em 10 s; HTTP/rede/timeout geram erro tipado, sem mensagem de UI.
- **Dependências:** T-01, T-05.
- **Arquivos prováveis:** `src/services/openMeteo.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-01, FR-02, AC-01 a AC-05, NFR-04.

### T-07 — Implementar serviço de forecast

- **Descrição:** buscar clima atual e previsão para a cidade selecionada.
- **Critérios de aceite:** request envia current `temperature_2m`, `apparent_temperature`, `relative_humidity_2m`, `weather_code` e daily `weather_code`, `temperature_2m_min`, `temperature_2m_max`, `precipitation_probability_max`; inclui coordenadas exatas, `timezone=auto`, `forecast_days=5` e Celsius; timeout ocorre em 10 s; HTTP/rede/JSON geram erro tipado; aceita `AbortSignal`; não grava cache nem persiste dados.
- **Dependências:** T-01, T-03, T-05.
- **Arquivos prováveis:** `src/services/openMeteo.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-03, FR-04, FR-06, AC-05 a AC-09, AC-12, AC-13, AC-17, AC-18.

## Entrega 4 — Hook

### T-08 — Implementar hook para busca e seleção de cidade

- **Descrição:** coordenar query, chamadas de geocoding, resultados e seleção explícita.
- **Critérios de aceite:** estado inicial da busca é `idle`; query vazia faz zero chamadas; query válida transita `loading` para `success`, `empty` ou `error`; retry reutiliza a query; resposta obsoleta não substitui a atual; seleção guarda apenas a cidade escolhida e ainda não chama forecast.
- **Dependências:** T-06.
- **Arquivos prováveis:** `src/hooks/useWeatherSearch.ts`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-01, FR-02, NFR-04, AC-02, AC-03, AC-05, AC-17.

## Entrega 5 — Componentes

### T-09 — Criar busca e lista de cidades

- **Descrição:** apresentar input, resultados e estados do fluxo de geocoding.
- **Critérios de aceite:** textos visíveis estão em pt-BR; `region`/`country` fornecidos são renderizados e ausências não recebem substitutos; homônimos mostram regiões/países diferentes; props loading/empty/error renderizam indicadores/mensagens; teclado move foco entre resultados e `Enter`/`Space` seleciona o item focado; componentes não chamam `fetch`.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`, `src/components/LocationResults.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-01, FR-02, FR-07, AC-01 a AC-05, AC-19.

### T-10 — Criar apresentação do clima e previsão

- **Descrição:** renderizar condições atuais e as cinco datas diárias.
- **Critérios de aceite:** fixture completa exibe os quatro campos atuais; forecast renderiza exatamente cinco datas consecutivas, cada linha com condição, mínima, máxima e probabilidade máxima; ausências são identificadas sem zero ou valor de outra data; local e horário da fonte são exibidos quando disponíveis; 61 minutos sinaliza desatualização e 60 minutos não.
- **Dependências:** T-01, T-02, T-03, T-04.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `src/components/DailyForecast.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-03, FR-04, FR-06, FR-07, AC-06 a AC-09, AC-12, AC-13, AC-21.

### T-11 — Criar controle de unidade

- **Descrição:** permitir alternar entre Celsius e Fahrenheit durante a sessão.
- **Critérios de aceite:** Celsius é selecionado ao montar e usa sufixo `°C`; controle tem nome acessível e opera por teclado; selecionar Fahrenheit apresenta `20 °C` como `68 °F` e mostra o sufixo `°F`; alternar não chama serviço; reload inicia em Celsius.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `src/components/TemperatureUnitToggle.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-05, AC-10, AC-11, AC-19.

## Entrega 6 — Integração

### T-12 — Compor a tela principal

- **Descrição:** compor a primeira fatia visível: busca manual, resultados e seleção, sem depender do forecast.
- **Critérios de aceite:** `App` conecta T-08 a T-09; busca válida mostra até cinco cidades na ordem recebida; query vazia não chama serviço; loading, vazio e erro são renderizados; selecionar cidade mantém a seleção identificada; não há autenticação, geolocalização ou persistência.
- **Dependências:** T-08, T-09.
- **Arquivos prováveis:** `src/App.tsx`, `src/main.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-01, FR-02, FR-07, AC-01 a AC-05, AC-14, AC-19.

## Entrega 7 — Extensão de forecast

### T-13 — Estender hook com consulta meteorológica

- **Descrição:** adicionar ao hook a chamada de forecast após a seleção explícita.
- **Critérios de aceite:** selecionar uma cidade chama T-07 uma vez com suas coordenadas e passa `weatherStatus` por `loading` para `success`, `empty` ou `error`; retry mantém a cidade; respostas obsoletas não sobrescrevem a atual; selecionar outra cidade descarta o relatório anterior.
- **Dependências:** T-07, T-08.
- **Arquivos prováveis:** `src/hooks/useWeatherSearch.ts`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-02 a FR-04, FR-06, NFR-04, AC-05 a AC-09, AC-17, AC-18.

### T-14 — Integrar forecast e unidade à tela

- **Descrição:** completar a tela com dados atuais, previsão diária e alternância de temperatura.
- **Critérios de aceite:** `App` conecta T-13 a T-10/T-11; seleção da cidade apresenta clima e cinco dias locais; campos ausentes permanecem indisponíveis; alternar unidade não chama serviço; nome/local e referência temporal acompanham os dados; fluxo continua sem autenticação, geolocalização ou persistência.
- **Dependências:** T-10, T-11, T-12, T-13.
- **Arquivos prováveis:** `src/App.tsx`, `src/main.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-03 a FR-08, NFR-02, NFR-05, NFR-08, AC-06 a AC-15, AC-19, AC-21, AC-24.

## Entrega 8 — Testes

### T-15 — Testar conversão de unidade e formatação (Vitest)

- **Descrição:** cobrir conversão de temperatura, formatação local e atualidade com fixtures controladas.
- **Critérios de aceite:** Vitest verifica `20 °C → 68 °F`, `-40 °C → -40 °F` e `0.5 °C → 33 °F`, com rótulos/unidades; duas fixtures de timezone produzem datas/horas esperadas; 60 minutos não é stale, 61 é stale e `observedAt` ausente retorna indisponibilidade.
- **Dependências:** T-02, T-03.
- **Arquivos prováveis:** `tests/unit/lib/temperature.test.ts`, `tests/unit/lib/dateTime.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-10 a AC-13, AC-21.

### T-16 — Testar rótulos WMO e mapeadores

- **Descrição:** testar códigos meteorológicos e normalização dos formatos externos.
- **Critérios de aceite:** Vitest verifica código `3` como `Nublado`, código conhecido como rótulo não vazio e desconhecido como indisponível; payloads mapeiam campos documentados; unidade incompatível/estrutura inválida falha; arrays curtos/desalinhados preservam cinco datas sem transferir valores.
- **Dependências:** T-04, T-05.
- **Arquivos prováveis:** `tests/unit/lib/weatherCode.test.ts`, `tests/unit/lib/openMeteoMappers.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-05, AC-07 a AC-09, AC-18.

### T-17 — Testar serviço de geocoding com `fetch` mockado

- **Descrição:** validar parâmetros, resultados e falhas com `fetch` mockado.
- **Critérios de aceite:** Vitest substitui `fetch` por mock e verifica query `Santiago`, `São Tomé` preservada após decodificação, cinco primeiros de seis em ordem e lista vazia; HTTP não-OK, rede, timeout de 10 s, JSON inválido e abort signal produzem os erros definidos; nenhuma chamada chega à API real.
- **Dependências:** T-06.
- **Arquivos prováveis:** `tests/unit/services/openMeteo.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-01 a AC-04, AC-17.

### T-18 — Testar serviço de forecast com `fetch` mockado

- **Descrição:** validar request, resposta e falhas com `fetch` mockado.
- **Critérios de aceite:** Vitest substitui `fetch` por mock e confirma parâmetros/campos/coordenadas; resposta completa/parcial produz `WeatherData` esperado; HTTP não-OK, rede, JSON inválido e timeout aos 10 s produzem erro tipado; abort signal cancela a requisição; nenhuma chamada usa rede real.
- **Dependências:** T-07.
- **Arquivos prováveis:** `tests/unit/services/openMeteo.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-05 a AC-09, AC-17, AC-18.

### T-19 — Testar hook de busca e seleção

- **Descrição:** cobrir o hook da primeira fatia com serviços de geocoding mockados.
- **Critérios de aceite:** Vitest verifica estado inicial `idle`; busca vazia faz zero chamadas; busca válida percorre `loading` para `success/empty/error`; retry mantém a query; resposta obsoleta não substitui a atual; seleção guarda a cidade e não chama forecast.
- **Dependências:** T-08.
- **Arquivos prováveis:** `tests/unit/hooks/useWeatherSearch.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-02, AC-03, AC-05, AC-17.

### T-20 — Testar hook de forecast e concorrência

- **Descrição:** cobrir extensão meteorológica do hook com serviços mockados.
- **Critérios de aceite:** Vitest verifica que forecast é chamado só após seleção, com status `loading` para `success/empty/error`; retry mantém cidade; trocar cidade descarta relatório anterior; resolução obsoleta não sobrescreve a atual; alternância de unidade não aumenta contagem de chamadas.
- **Dependências:** T-13.
- **Arquivos prováveis:** `tests/unit/hooks/useWeatherSearch.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-05, AC-11, AC-17, AC-18.

### T-21 — Testar estados dos componentes de busca

- **Descrição:** verificar apresentação e acessibilidade dos componentes da primeira fatia.
- **Critérios de aceite:** Testing Library renderiza fixtures loading/vazio/erro/sucesso; `getByRole`/`getByLabelText` localizam input e envio; dados regionais aparecem quando fornecidos; homônimos mostram distinções; foco chega aos resultados e `Enter`/`Space` seleciona.
- **Dependências:** T-09.
- **Arquivos prováveis:** `tests/unit/components/SearchForm.test.tsx`, `tests/unit/components/LocationResults.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-01 a AC-05, AC-19.

### T-22 — Testar componentes meteorológicos

- **Descrição:** verificar valores, indisponibilidades e acessibilidade das visualizações de clima.
- **Critérios de aceite:** Testing Library verifica os quatro campos atuais; omitir cada campo produz indisponibilidade; lista diária contém cinco datas incluindo placeholder; local/horário seguem fixture; 61 minutos sinaliza stale e 60 não; ausência nunca renderiza `0`; loading/erro usa região acessível anunciável.
- **Dependências:** T-10.
- **Arquivos prováveis:** `tests/unit/components/CurrentWeather.test.tsx`, `tests/unit/components/DailyForecast.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-06 a AC-09, AC-12, AC-13, AC-18, AC-21.

### T-23 — Testar controle de unidade

- **Descrição:** validar interação e apresentação do controle Celsius/Fahrenheit.
- **Critérios de aceite:** teste inicia em Celsius e mostra `°C`; teclado seleciona Fahrenheit e `20 °C` renderiza `68 °F` com sufixo `°F`; callback de serviço mantém zero chamadas durante a alternância.
- **Dependências:** T-11.
- **Arquivos prováveis:** `tests/unit/components/TemperatureUnitToggle.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-10, AC-11, AC-19.

### T-24 — Testar E2E da fatia de busca

- **Descrição:** validar o primeiro resultado visível com APIs interceptadas no Playwright.
- **Critérios de aceite:** busca aparada apresenta no máximo cinco resultados em ordem; input vazio não faz request; estados loading/vazio/erro/sucesso são renderizados; selecionar homônimo preserva a cidade selecionada; fluxo por teclado funciona; toda chamada é interceptada e API real não é acessada.
- **Dependências:** T-12, T-17, T-19, T-21.
- **Arquivos prováveis:** `tests/e2e/weather-search.spec.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-01 a AC-05, AC-17, AC-19.

### T-25 — Testar fluxo E2E completo

- **Descrição:** executar fluxo de busca, clima, previsão e unidade com APIs interceptadas.
- **Critérios de aceite:** seleção do segundo homônimo envia coordenadas exatas; forecast apresenta clima atual e cinco datas; alternância não aumenta requests; HTTP/rede apresenta retry e encerra loading; campo omitido fica indisponível; reload limpa query/cidade e inicia Celsius; nenhuma chamada chega à API real.
- **Dependências:** T-14, T-15, T-16, T-18, T-20, T-22, T-23, T-24.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-05 a AC-15, AC-17, AC-18, AC-24.

### T-26 — Executar fluxo E2E principal em viewport mobile

- **Descrição:** repetir o fluxo E2E principal em viewport estreito e com nomes longos.
- **Critérios de aceite:** com viewport de `320 CSS px`, Playwright executa busca, seleção, consulta de clima/previsão e troca de unidade; `scrollWidth` não excede `clientWidth`; controles permanecem visíveis, sem sobreposição, e respondem a toque e teclado.
- **Dependências:** T-25.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-16, NFR-01, NFR-02.

## Entrega 9 — Hardening

### T-27 — Medir desempenho

- **Descrição:** medir o fluxo de busca/consulta sob o perfil de rede definido na spec.
- **Critérios de aceite:** executa 100 amostras com resposta mockada em até 500 ms; relatório contém configuração, latências, p95 e timeout; se o alvo de 3 s for aprovado, ao menos 95/100 resultados renderizam até 3 s; requisição sem resposta termina em até 10 s.
- **Dependências:** T-25, T-26.
- **Arquivos prováveis:** `tests/e2e/weather-performance.spec.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** NFR-03, AC-20.

### T-28 — Verificar compatibilidade de navegadores

- **Descrição:** executar e registrar a matriz de browsers desktop e mobile exigida.
- **Critérios de aceite:** matriz registra versão e resultado de busca, seleção, consulta e unidade nas duas versões estáveis mais recentes de Chrome/Edge/Firefox/Safari, duas versões principais de Safari iOS e duas versões principais de Chrome Android; cada ambiente suportado é executado e passa, ou fica bloqueado com falha registrada e release não aprovado.
- **Dependências:** T-25, T-26.
- **Arquivos prováveis:** `playwright.config.ts`, `docs/test-matrix.md`.
- **Tipo:** Test.
- **Rastreabilidade:** NFR-07, AC-23.

### T-29 — Preparar gates operacionais e do fornecedor

- **Descrição:** documentar medição de disponibilidade e validação da Open-Meteo para release.
- **Critérios de aceite:** procedimento registra disponibilidade mensal do app e da Open-Meteo em métricas separadas e compara o app ao alvo proposto de 99,5%; evidência de termos, atribuição, cobertura e limites está arquivada; checklist impede release sem evidência; timeout de 10 s e metas propostas têm decisão/responsável registrados.
- **Dependências:** T-27, T-28.
- **Arquivos prováveis:** `docs/release-checklist.md`, `docs/monitoring.md`.
- **Tipo:** Infra.
- **Rastreabilidade:** NFR-03, NFR-06, NFR-09, AC-22, AC-25.

## Prioridade e tamanho

Prioridade indica ordem de valor/risco: **P0** desbloqueia a primeira fatia utilizável; **P1** completa os requisitos da V1 e os gates de release; **P2** cobre hardening de metas ainda propostas. Tamanho relativo: **P** é uma mudança focal; **M** envolve fluxo/moderada integração ou até dois arquivos; **G** cruza vários fluxos/ambientes ou exige medição ampla.

| Tarefa | Prioridade | Tamanho |
|---|---|---|
| T-01 | P0 | P |
| T-02 | P1 | P |
| T-03 | P0 | M |
| T-04 | P1 | P |
| T-05 | P0 | M |
| T-06 | P0 | M |
| T-07 | P1 | M |
| T-08 | P0 | M |
| T-09 | P0 | M |
| T-10 | P1 | M |
| T-11 | P1 | P |
| T-12 | P0 | M |
| T-13 | P1 | M |
| T-14 | P1 | M |
| T-15 | P1 | M |
| T-16 | P1 | M |
| T-17 | P0 | P |
| T-18 | P1 | P |
| T-19 | P0 | P |
| T-20 | P1 | P |
| T-21 | P0 | M |
| T-22 | P1 | M |
| T-23 | P1 | P |
| T-24 | P0 | M |
| T-25 | P1 | G |
| T-26 | P1 | M |
| T-27 | P2 | M |
| T-28 | P1 | G |
| T-29 | P1 | M |

## Sequência em fatias verticais

| Fatia | Tarefas na ordem de execução | Resultado demonstrável |
|---|---|---|
| 1. Busca de cidades | T-01 → T-03 → T-05 → T-06 → T-08 → T-09 → T-12 → T-17 → T-19 → T-21 → T-24 | Tela permite buscar, ver até cinco resultados em ordem, selecionar uma cidade e tratar loading/vazio/erro; fluxo validado por Vitest e Playwright, sem aguardar forecast. |
| 2. Clima e previsão | T-02 → T-04 → T-07 → T-10 → T-11 → T-13 → T-14 → T-15 → T-16 → T-18 → T-20 → T-22 → T-23 → T-25 | Cidade selecionada mostra clima atual, cinco dias locais e alternância de unidade; campos ausentes, falhas e fluxo completo têm cobertura automatizada. |
| 3. Hardening para release | T-26 → T-27 → T-28 → T-29 | Validação mobile, desempenho, navegadores e gates operacionais/termos antes da publicação. |

As dependências continuam sendo os bloqueios de execução; a sequência acima antecipa a demonstração da busca. As tarefas P1 seguem necessárias para concluir a V1, enquanto T-27 é P2 porque o alvo de desempenho de 3 s ainda depende de aprovação de produto.