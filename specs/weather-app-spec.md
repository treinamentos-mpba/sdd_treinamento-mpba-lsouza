# Especificação de Produto — Weather App

## Overview

O Weather App permite buscar uma cidade, consultar suas condições atuais e ver a previsão diária de hoje e dos quatro dias seguintes. A interface é pt-BR, prioriza dispositivos móveis e permite alternar a temperatura entre Celsius e Fahrenheit.

Decisões confirmadas: Open-Meteo sem API key, Celsius inicial, acesso sem autenticação e sem persistência no servidor. Para tornar a V1 implementável, esta spec adota a baseline funcional e os alvos de qualidade abaixo como propostas explícitas; valide-os antes de tratá-los como compromissos de negócio. A verificação dos termos e limites atuais do fornecedor continua sendo gate de release.

## Functional Requirements

- **FR-01 — Buscar cidades:** aceitar texto não vazio após remoção de espaços nas extremidades; preservar letras acentuadas, espaços, hífens e apóstrofos; apresentar até cinco resultados na ordem recebida da geocodificação. Consulta vazia não deve chamar a fonte.
- **FR-02 — Selecionar cidade:** permitir selecionar um único resultado. Exibir nome da cidade e, quando fornecidos, região/estado e país. Usar latitude e longitude do resultado selecionado nas consultas meteorológicas.
- **FR-03 — Consultar clima atual:** apresentar temperatura, sensação térmica, condição meteorológica e umidade relativa retornadas para a cidade selecionada. Se um campo não vier na resposta, identificá-lo como indisponível; não inventar valores.
- **FR-04 — Consultar previsão diária:** apresentar cinco datas locais consecutivas, começando hoje, com condição meteorológica, temperaturas mínima/máxima e probabilidade máxima de precipitação de cada dia. Usar o fuso horário retornado para a localização selecionada.
- **FR-05 — Alternar unidade de temperatura:** apresentar todas as temperaturas em Celsius ou Fahrenheit, iniciando em Celsius. Converter apenas a apresentação, manter os dados de origem e arredondar ao inteiro mais próximo; mostrar a unidade junto a cada temperatura.
- **FR-06 — Identificar local e referência dos dados:** manter nome e região/país disponíveis junto aos dados. Exibir a hora de observação retornada pela fonte no fuso local; se não houver horário, indicar que a referência temporal está indisponível.
- **FR-07 — Usar a interface em pt-BR:** apresentar textos, mensagens de estado e controles em português do Brasil; formatar datas como `dd/MM/yyyy`, horários em formato de 24 horas e unidades não convertidas como °C, km/h e mm, conforme o campo.
- **FR-08 — Acessar sem conta:** permitir busca e consulta sem cadastro, credenciais ou autenticação.

## User Stories

- **US-01 — Consulta cotidiana:** Como pessoa que organiza a rotina diária, quero buscar minha cidade e consultar o clima atual para me preparar para o dia. **Requisitos relacionados:** FR-01, FR-02, FR-03.
- **US-02 — Escolha do destino:** Como viajante, quero distinguir e selecionar a cidade de destino entre os resultados da busca para consultar o clima do local correto. **Requisitos relacionados:** FR-01, FR-02.
- **US-03 — Planejamento de viagem:** Como viajante, quero consultar a previsão de hoje e dos quatro dias seguintes para planejar os próximos dias no destino. **Requisitos relacionados:** FR-04, FR-06.
- **US-04 — Preferência de temperatura:** Como pessoa que organiza a rotina diária, quero alternar a temperatura entre Celsius e Fahrenheit para interpretar os valores na unidade que prefiro. **Requisitos relacionados:** FR-05.
- **US-05 — Planejamento de atividade:** Como pessoa que planeja atividades ao ar livre, quero consultar a previsão da cidade e do período desejados para decidir quando realizar uma atividade. Os dados necessários para essa decisão ainda precisam ser definidos. **Requisitos relacionados:** FR-04, FR-06.
- **US-06 — Idioma da interface:** Como pessoa que organiza a rotina diária, quero usar a interface em português do Brasil para compreender as informações meteorológicas. **Requisitos relacionados:** FR-07.
- **US-07 — Acesso sem conta:** Como viajante, quero consultar o clima sem criar uma conta para planejar o destino sem uma etapa de cadastro. **Requisitos relacionados:** FR-08.

## Acceptance Criteria

Os cenários usam respostas mockadas e determinísticas; testes automatizados não devem depender da API real. A data base de cada cenário é fixa e o fuso vem da fixture da cidade. Os valores de desempenho e disponibilidade são alvos propostos na seção Non-Functional Requirements.

| ID | Requisito relacionado | Given | When | Then |
|---|---|---|---|---|
| AC-01 | FR-01 | A geocodificação mockada retorna seis resultados para `Santiago`. | A pessoa envia ` Santiago ` na busca. | O app envia `Santiago` após remover espaços e apresenta somente os cinco primeiros resultados, na ordem recebida. |
| AC-02 | FR-01 | O campo de busca está vazio ou contém apenas espaços. | A pessoa tenta iniciar a busca. | Nenhuma chamada de geocodificação ocorre; o campo permanece utilizável e uma mensagem solicita a cidade. |
| AC-03 | FR-01 | A geocodificação mockada retorna uma lista vazia para `CidadeInexistente`. | A pessoa envia o termo. | O estado sem resultados é apresentado, o termo permanece editável e nenhuma consulta meteorológica ocorre. |
| AC-04 | FR-01 | A pessoa busca `São Tomé`; a fixture retorna um resultado para esse termo. | A busca é enviada. | O termo chega à geocodificação sem corrupção de acentos e o resultado retornado é apresentado. |
| AC-05 | FR-02 | A busca retorna duas cidades homônimas com latitudes/longitudes distintas. | A pessoa seleciona a segunda cidade. | A seleção mostra o nome e os campos regionais disponíveis, e a consulta meteorológica usa exatamente as coordenadas do segundo resultado. |
| AC-06 | FR-03 | A cidade selecionada tem fixture com temperatura `21 °C`, sensação `20 °C`, condição `Nublado` e umidade `70%`. | A consulta atual termina com sucesso. | Os quatro valores aparecem associados à cidade selecionada, com unidades corretas. |
| AC-07 | FR-03 | A fixture do clima atual não contém umidade. | A consulta atual termina com sucesso. | Temperatura, sensação e condição são exibidas; umidade aparece como indisponível, nunca como zero. |
| AC-08 | FR-04 | A fixture da cidade tem data local `2026-05-10` e dados para cinco datas, além de uma data anterior e outra posterior. | A pessoa abre a previsão diária. | São exibidas exatamente as datas `10/05/2026` a `14/05/2026`; cada data mostra condição, mínima, máxima e probabilidade de precipitação da fixture. |
| AC-09 | FR-04 | A fixture não contém dados para uma das cinco datas. | A pessoa abre a previsão. | As outras datas válidas são exibidas; a data ausente é identificada como indisponível e não é preenchida com dados de outro dia. |
| AC-10 | FR-05 | A fixture contém temperaturas `20 °C`, `-40 °C` e `0.5 °C`; Celsius é a unidade inicial. | A pessoa alterna para Fahrenheit. | Os valores são exibidos como `68 °F`, `-40 °F` e `33 °F`, respectivamente, com unidade visível. |
| AC-11 | FR-05 | A unidade selecionada é Fahrenheit e a pessoa inicia uma nova busca na mesma sessão. | A nova resposta contém temperatura `20 °C`. | A temperatura é exibida em Fahrenheit (`68 °F`); ao recarregar o app, a unidade volta ao padrão Celsius. |
| AC-12 | FR-06 | A fixture contém `Recife`, região, país e horário local `2026-05-10T12:00:00-03:00`. | O app apresenta os dados. | Localização disponível e horário `10/05/2026 12:00` são exibidos junto aos dados. |
| AC-13 | FR-06 | A resposta contém cidade mas não contém horário de observação. | O app apresenta os dados. | A cidade é identificada e o horário aparece como indisponível; nenhum horário de consulta é rotulado como observação. |
| AC-14 | FR-07 | A interface mostra data, hora, unidade e mensagens de carregamento, vazio e erro. | A pessoa navega pelos estados em pt-BR. | Datas seguem `dd/MM/yyyy`, horas `HH:mm`, e todos os textos visíveis correspondem ao catálogo pt-BR aprovado. |
| AC-15 | FR-08 | A pessoa não possui conta nem credenciais. | Abre o app, busca e seleciona uma cidade e consulta uma resposta válida. | O fluxo termina sem cadastro, credenciais ou autenticação. |
| AC-16 | NFR-01 | O app é aberto em um viewport com largura de `320 CSS px`. | A pessoa executa busca, seleção e alternância de unidade. | Controles e resultados permanecem utilizáveis, sem sobreposição ou rolagem horizontal da página. |
| AC-17 | NFR-04 | A API retorna erro HTTP ou não responde dentro de `10 s`. | A busca ou consulta é enviada. | O carregamento termina, a mensagem correspondente e nova tentativa aparecem, o termo/cidade fica preservado e dados antigos não são marcados como atuais. |
| AC-18 | NFR-04 | A resposta omite um campo meteorológico ou uma data de previsão. | O app renderiza a resposta. | Campos disponíveis aparecem; os ausentes são identificados como indisponíveis; nenhum valor é fabricado nem copiado de outra data. |
| AC-19 | NFR-02 | A pessoa usa somente teclado e um leitor de tela nos fluxos principais. | Busca, escolhe resultado, consulta clima e alterna unidade. | Todos os passos podem ser concluídos, o foco permanece visível e alterações de carregamento/erro são anunciadas. |
| AC-20 | NFR-03 | O teste de performance executa 100 consultas com perfil de rede de referência e resposta de serviço em até 500 ms. | Busca ou consulta é iniciada. | Em pelo menos 95 das 100 execuções, o resultado é renderizado em até 3 s; qualquer execução sem resposta em 10 s termina em timeout. |
| AC-21 | NFR-05 | A resposta contém horário de observação de 61 minutos antes da hora de referência do teste. | O clima atual é renderizado. | O app exibe o horário da fonte e sinaliza os dados como desatualizados; para dados com até 60 minutos, não exibe esse sinal. |
| AC-22 | NFR-06 | O monitoramento de produção coleta disponibilidade do app e da Open-Meteo separadamente durante um mês. | O período mensal de medição termina. | A disponibilidade do app é calculada excluindo falhas da Open-Meteo e comparada com a meta de 99,5%; ambos os indicadores ficam registrados. |
| AC-23 | NFR-07 | A matriz de teste contém as duas versões estáveis mais recentes de Chrome, Edge, Firefox e Safari, Safari nas duas versões principais mais recentes de iOS e Chrome nas duas versões principais mais recentes de Android. | Os fluxos de busca, seleção, consulta e troca de unidade são executados em cada ambiente. | Todos os fluxos passam em todos os ambientes suportados; a matriz é atualizada a cada release. |
| AC-24 | NFR-08 | O app está aberto e a pessoa executa busca, consulta e recarrega a página. | A sessão termina ou a página é recarregada. | Nenhum dado de busca, local ou preferência permanece em armazenamento local ou no servidor do app; as requisições ao fornecedor usam HTTPS e nenhuma permissão de geolocalização é solicitada. |
| AC-25 | NFR-09 | O release candidate está pronto para publicação. | A revisão de uso da Open-Meteo é concluída. | Há registro de que termos, atribuição, cobertura e limites de uso permitem o uso previsto; a publicação é bloqueada se qualquer item não estiver confirmado. |

## Non-Functional Requirements

- **NFR-01 — Responsividade:** suportar larguras de 320 CSS px ou maiores; nos fluxos principais não pode haver sobreposição, corte de controles ou rolagem horizontal da página.
- **NFR-02 — Acessibilidade:** cumprir WCAG 2.2 AA. Busca, seleção, consulta e troca de unidade devem ser operáveis por teclado; foco visível; estados dinâmicos anunciados por leitor de tela.
- **NFR-03 — Desempenho:** alvo V1: p95 de até 3 s entre envio da busca/consulta e renderização do resultado em perfil de rede de referência; timeout de 10 s. O teste usa 100 execuções e resposta de serviço em até 500 ms. Os valores são propostas para validação de negócio.
- **NFR-04 — Robustez:** falhas HTTP, rede, timeout, payload inválido e ausência de resultados devem terminar o carregamento e apresentar estado específico; permitir nova tentativa sem perder a cidade/termo atual.
- **NFR-05 — Atualidade dos dados:** exibir o horário de observação fornecido pela fonte. Se o dado atual tiver mais de 60 minutos, sinalizá-lo como desatualizado; se não houver timestamp, informar indisponibilidade da referência.
- **NFR-06 — Disponibilidade:** alvo V1 de 99,5% mensal para a aplicação; indisponibilidade da Open-Meteo deve ser medida separadamente e não ocultada como falha do app.
- **NFR-07 — Compatibilidade:** suportar as duas versões estáveis mais recentes de Chrome, Edge, Firefox e Safari; Safari nas duas versões principais mais recentes de iOS; Chrome nas duas versões principais mais recentes de Android; viewport mínimo de 320 CSS px.
- **NFR-08 — Privacidade e segurança:** não exigir conta, não persistir dados no servidor nem no dispositivo nesta versão e usar HTTPS. Não solicitar geolocalização. Consultas de cidade são enviadas à Open-Meteo para geocodificação e clima.
- **NFR-09 — Condições da fonte de dados:** cumprir termos, atribuição e limites vigentes da Open-Meteo; validação desses requisitos é obrigatória antes do release.

## Traceability Matrix

| User Story | Requisitos funcionais | Acceptance Criteria | NFRs relevantes |
|---|---|---|---|
| US-01 — Consulta cotidiana | FR-01, FR-02, FR-03 | AC-01 a AC-07, AC-17, AC-18, AC-20 a AC-25 | NFR-01 a NFR-09 |
| US-02 — Escolha do destino | FR-01, FR-02 | AC-01, AC-03 a AC-05, AC-17, AC-20, AC-22 a AC-25 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-06, NFR-07, NFR-08, NFR-09 |
| US-03 — Planejamento de viagem | FR-04, FR-06 | AC-08, AC-09, AC-12, AC-13, AC-17, AC-18, AC-20 a AC-23, AC-25 | NFR-01 a NFR-07, NFR-09 |
| US-04 — Preferência de temperatura | FR-05 | AC-10, AC-11, AC-16, AC-19, AC-23 | NFR-01, NFR-02, NFR-07 |
| US-05 — Planejamento de atividade | FR-04, FR-06 | AC-08, AC-09, AC-12, AC-13, AC-17, AC-18, AC-20 a AC-23, AC-25 | NFR-01 a NFR-07, NFR-09 |
| US-06 — Idioma da interface | FR-07 | AC-14, AC-19, AC-23 | NFR-02, NFR-07 |
| US-07 — Acesso sem conta | FR-08 | AC-15, AC-24 | NFR-08 |

## Edge Cases

| Caso | Comportamento esperado |
|---|---|
| Cidade inexistente ou fora da cobertura | Se uma busca válida não corresponder a uma cidade suportada, informar que nenhum local correspondente foi encontrado, sugerir conferir a grafia ou tentar outro nome e permitir nova busca. Não solicitar clima para uma localização não selecionada. |
| Input vazio ou só com espaços | Remover espaços nas extremidades para validação. Se não restar texto, não chamar o serviço de geocodificação, manter o campo disponível e pedir que a pessoa informe uma cidade. |
| Caracteres especiais em nomes | Preservar caracteres válidos de nomes de locais, incluindo acentos, espaços, hífens e apóstrofos, e enviá-los como texto de busca corretamente codificado. Não interpretar esses caracteres como comandos. Se não houver correspondência, apresentar o estado sem resultados. |
| Falha de API | Em falha de rede, resposta HTTP de erro ou resposta impossível de interpretar, encerrar o carregamento, informar que não foi possível obter os dados e oferecer nova tentativa. Preservar a busca e não apresentar dados antigos como atuais. |
| Timeout | Se a requisição exceder o limite configurado, encerrar o estado de carregamento, informar que a consulta demorou demais e oferecer nova tentativa. Ignorar uma resposta tardia se uma tentativa posterior já tiver sido iniciada. A duração do limite ainda precisa ser definida. |
| Geocoding sem resultados | Tratar uma resposta válida de geocodificação com lista vazia como ausência de correspondências, não como erro técnico. Mostrar estado sem resultados, preservar o termo pesquisado e não consultar a API meteorológica. Não afirmar que a cidade não existe; a fonte pode não cobri-la. |
| Resposta parcial | Exibir os campos válidos recebidos e identificar como indisponíveis os campos ausentes. Nunca substituir um valor ausente por zero ou por dado inventado. Se faltar o dado essencial para uma seção, mostrar indisponibilidade nessa seção sem ocultar outras seções com dados válidos. |
| Cidades homônimas | Se houver mais de um resultado com o mesmo nome, mostrar os dados de localização disponíveis para distingui-los e aguardar seleção explícita antes de consultar o clima. |
| Cidade encontrada sem clima ou previsão | Informar que os dados da seção não estão disponíveis para o local selecionado; manter a cidade identificada e permitir nova tentativa quando apropriado. |
| Resposta sem horário de referência | Exibir a cidade e os dados disponíveis, mas não inventar nem inferir um horário de atualização. |
| Mudança de data ou fuso horário | Associar a janela da previsão à data local da cidade selecionada, conforme a regra de fuso horário que vier a ser aprovada; não misturar datas de fusos diferentes. |
| Temperatura zero, negativa ou fracionária | Converter o valor normalmente entre Celsius e Fahrenheit e manter o rótulo da unidade correto; aplicar a regra de arredondamento que vier a ser definida. |
| Alternância de unidade durante carregamento ou nova busca | Aplicar a unidade selecionada aos dados quando forem exibidos, sem misturar valor convertido e rótulo de outra unidade. |
| Nome de cidade longo em tela móvel | Permitir que o nome e os dados de localização sejam lidos sem sobrepor controles ou conteúdo adjacente. |
| Permissão de localização recusada | Caso geolocalização seja aprovada, respeitar a recusa e manter a busca manual disponível; não bloquear o uso principal do app. |

## Assumptions

- O produto destina-se a usuários finais que consultam o clima de uma cidade; as personas atuais são hipóteses a validar.
- A baseline proposta da V1 usa temperatura, sensação térmica, condição e umidade no clima atual; na previsão diária usa condição, mínimas/máximas e probabilidade máxima de precipitação.
- “Hoje” corresponde à data local da cidade, usando o fuso horário retornado para essa localização.
- Celsius/Fahrenheit aplica-se às temperaturas; unidades de vento e precipitação são km/h e mm, respectivamente. Temperaturas são arredondadas ao inteiro mais próximo.
- Clima atual e previsão pertencem à cidade selecionada.
- A busca é manual, retorna no máximo cinco resultados e não solicita localização do dispositivo.
- Preferência de unidade existe apenas durante a sessão; recarregar inicia em Celsius. Não há cache ou armazenamento local persistente na V1.
- Os alvos numéricos de desempenho, disponibilidade, atualidade e compatibilidade são propostas iniciais para validação do responsável pelo produto.

## Risks

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Open-Meteo ficar indisponível, lenta ou limitar consultas. | Média | Clima e previsão podem não carregar. | Confirmar termos e limites; definir timeout, tratamento de erro e nova tentativa; avaliar cache local sem violar a decisão de não persistir no servidor. |
| Busca selecionar ou induzir a seleção de cidade incorreta. | Média | Informações meteorológicas de outro local podem levar a decisões equivocadas. | Exibir região/estado/país conforme disponibilidade e exigir seleção explícita quando houver ambiguidade. |
| Dados desatualizados, incompletos ou associados ao fuso horário incorreto. | Média | Previsão enganosa e perda de confiança. | Confirmar cobertura e frequência de atualização; definir regra de fuso e idade máxima aceitável; exibir referência temporal quando disponível. |
| Latência ou falha de rede prejudicar o uso móvel. | Média | O app pode parecer indisponível em um contexto de uso prioritariamente móvel. | Definir metas de latência e suporte; apresentar carregamento, erro e recuperação testáveis. |
| Conversão ou identificação de unidade incorreta. | Baixa | Temperatura pode ser interpretada incorretamente. | Manter rótulo junto ao valor e validar conversão, arredondamento e alternância. |
| Armazenamento local ou localização serem implementados sem política clara. | Baixa/média | Risco à privacidade e à confiança do usuário. | Definir consentimento, finalidade, retenção e armazenamento antes de implementar esses recursos. |
| Personas ou necessidades prioritárias não representarem usuários reais. | Média | Baixa adoção ou prioridades de produto inadequadas. | Validar personas, jornadas e métricas com usuários/stakeholders antes de ampliar o escopo. |
| Campos e granularidade da previsão não corresponderem à expectativa do usuário. | Média | Retrabalho de produto e experiência incompleta. | Fechar campos e granularidade antes de aprovar critérios definitivos e iniciar implementação. |

## Out of Scope

- Autenticação, contas de usuário e persistência de dados no servidor ou no dispositivo.
- Geolocalização automática, favoritos, histórico de cidades e sincronização entre dispositivos.
- Previsão horária, mapas, radar, alertas meteorológicos, notificações push e widgets.
- Uso offline e exibição de dados em cache após falha da fonte.
- Conversão de unidades de vento ou precipitação; somente temperatura alterna entre °C e °F.
- Cobertura de dados garantida para locais não retornados ou não atendidos pela Open-Meteo.

## Open Questions

1. Os campos e alvos V1 registrados em **Assumptions** são aprovados pelo responsável do produto? Até a aprovação, devem ser tratados como baseline proposta, não como compromisso comercial.
2. A revisão dos termos, limites de uso e atribuição da Open-Meteo confirma que o uso pretendido é permitido? Esta verificação é gate de release.
3. As personas e o objetivo de concluir a consulta em até um minuto serão validados com usuários? Definir a meta de sucesso de usabilidade antes de declarar o produto validado.

As demais decisões de comportamento da V1 estão explicitadas nos requisitos, critérios de aceite e assumptions; qualquer alteração deve atualizar esses artefatos antes de derivar tarefas.