# Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa solicitou uma aplicação para que usuários consultem informações meteorológicas de cidades. O briefing pede busca de cidades, consulta do clima atual, previsão de cinco dias, alternância entre Celsius e Fahrenheit e uso em dispositivos móveis.

Foram definidas algumas decisões para destravar a especificação: usar Open-Meteo sem API key, considerar cinco dias como hoje mais os quatro seguintes, usar Celsius por padrão, não exigir autenticação nem persistir dados no servidor e oferecer a interface em português do Brasil (pt-BR). Personas e métricas abaixo são hipóteses iniciais e devem ser validadas.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade e escolha o local correto quando houver resultados ambíguos.
- **RF-02 — Consultar clima atual:** exibir as condições meteorológicas atuais da cidade selecionada.
- **RF-03 — Consultar previsão:** exibir a previsão de hoje e dos quatro dias seguintes para a cidade selecionada. A granularidade e os campos da previsão ainda precisam ser definidos.
- **RF-04 — Alternar unidades:** permitir alternar a apresentação de temperatura entre Celsius e Fahrenheit; Celsius é a unidade inicial.
- **RF-05 — Identificar dados:** indicar a cidade selecionada e, quando a fonte fornecer essa informação, o horário de referência ou atualização dos dados.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade:** conteúdo e controles devem permanecer utilizáveis em diferentes larguras de tela, com prioridade para dispositivos móveis. A matriz de dispositivos e tamanhos suportados precisa ser definida.
- **RNF-02 — Acessibilidade:** busca, seleção de cidade e alternância de unidade devem ser operáveis por teclado e identificáveis por tecnologias assistivas. WCAG 2.2 AA é uma meta proposta, ainda sujeita à aprovação.
- **RNF-03 — Desempenho:** busca e consulta meteorológica devem responder dentro de metas de latência a definir. A interface deve comunicar que está carregando enquanto aguarda os dados.
- **RNF-04 — Robustez:** falhas de rede, indisponibilidade da fonte e resultados vazios não devem deixar a interface sem resposta; o usuário deve receber uma indicação compreensível e uma forma de tentar novamente quando aplicável.
- **RNF-05 — Atualidade dos dados:** definir uma idade máxima aceitável para os dados apresentados, considerando a atualização fornecida pela fonte.
- **RNF-06 — Compatibilidade:** a aplicação deve funcionar nos navegadores e sistemas operacionais suportados, a serem definidos.
- **RNF-07 — Disponibilidade:** definir uma meta de disponibilidade para a aplicação e considerar separadamente a dependência da fonte externa Open-Meteo.
- **RNF-08 — Privacidade e segurança:** minimizar dados coletados e protegê-los em trânsito. Como não haverá autenticação nem persistência no servidor, armazenamento local e uso de localização do dispositivo continuam sujeitos a decisão e consentimento.

## Riscos

| Categoria | Risco | Probabilidade | Impacto | Mitigação sugerida |
|---|---|---|---|---|
| Técnico | Open-Meteo ficar indisponível, lenta ou limitar consultas. | Média | Clima e previsão podem não carregar, comprometendo o uso do app. | Confirmar limites e condições de uso; definir timeout, tratamento de erro e nova tentativa. Avaliar cache local sem pressupor persistência no servidor. |
| Técnico | Busca retornar uma cidade homônima ou localização incorreta. | Média | O usuário recebe dados de outro lugar e perde confiança no produto. | Exibir região/estado/país nos resultados e exigir seleção explícita quando houver ambiguidade. |
| Técnico | Dados estarem desatualizados, incompletos ou associados ao fuso horário incorreto. | Média | A previsão pode induzir decisões equivocadas. | Verificar cobertura e frequência de atualização; tratar fuso horário e exibir horário de referência quando disponível. |
| Técnico | Rede lenta ou indisponível impedir uma resposta útil. | Média | Experiência percebida como indisponível, sobretudo em dispositivos móveis. | Definir metas de latência, mostrar estados de carregamento e erro e oferecer nova tentativa. |
| Técnico | Conversão ou rótulo Celsius/Fahrenheit estar incorreto. | Baixa | Temperaturas exibidas podem ser enganosas. | Identificar unidade junto aos valores e testar conversão, arredondamento e alternância. |
| Técnico | Localização ou preferências serem armazenadas sem decisão clara sobre consentimento e retenção. | Baixa/média | Risco à privacidade e à confiança do usuário. | Não solicitar localização sem consentimento explícito; minimizar dados e decidir claramente se haverá armazenamento local. |
| Produto | O app não atender a uma necessidade prioritária ou não entregar valor distinto das alternativas. | Média | Baixa adoção e pouco valor para o negócio. | Validar personas, jornadas e métricas de sucesso com usuários e stakeholders antes de ampliar o escopo. |
| Produto | A previsão exibida não corresponder ao que usuários entendem por “previsão de cinco dias”. | Média | Frustração, decisões com informação insuficiente e retrabalho. | Confirmar granularidade e campos da previsão; a janela de datas já definida é hoje mais quatro dias. |
| Produto | Experiência móvel ou acessibilidade serem insuficientes para parte do público. | Média | Usuários podem não conseguir completar tarefas essenciais. | Definir matriz de suporte e critérios de acessibilidade; testar em dispositivos móveis, com teclado e tecnologias assistivas. |

## Perguntas em Aberto

1. **Quais são os limites de uso, a cobertura geográfica e as condições de uso/atribuição da Open-Meteo?** Impacto: a fonte foi escolhida, mas esses detalhes afetam disponibilidade, conformidade e comportamento sob limite de consultas.
2. **Quais informações devem compor o clima atual, como sensação térmica, umidade, vento ou condição do céu?** Impacto: sem definir os campos, escopo e aceite da tela permanecem subjetivos.
3. **A previsão será diária, horária ou ambas, e quais indicadores deve apresentar?** Impacto: determina a quantidade de dados, a integração e a organização da interface.
4. **Quais informações de região devem acompanhar cidades homônimas para o usuário escolher corretamente?** Impacto: sem regra de desambiguação, pode ser exibida a previsão do local errado.
5. **A unidade escolhida pelo usuário deve persistir entre visitas?** Impacto: define se será necessário armazenamento local; Celsius já está definido como padrão.
6. **A aplicação deve solicitar localização automática ou oferecer apenas busca manual?** Impacto: afeta permissões, privacidade e experiência inicial.
7. **Além da temperatura, quais unidades devem ser exibidas ou convertidas, por exemplo, vento e precipitação?** Impacto: evita apresentação inconsistente de medidas para diferentes localidades.
8. **Qual fuso horário define “hoje” e como datas e horas serão formatadas em pt-BR?** Impacto: pode deslocar o período da previsão ou confundir o usuário sobre quando os dados se aplicam.
9. **Sem persistência no servidor, haverá cache ou armazenamento local para uso offline ou preferências?** Impacto: afeta atualidade dos dados, privacidade e comportamento após recarregar ou revisitar o app.
10. **Quais navegadores, sistemas operacionais, resoluções e suporte a desktop são esperados?** Impacto: orienta compatibilidade, responsividade e cobertura de testes.
11. **Qual critério de acessibilidade será exigido? A meta proposta WCAG 2.2 AA é aceitável?** Impacto: sem um padrão verificável, a conformidade e a cobertura de testes ficam subjetivas.
12. **Qual é o tempo máximo aceitável para busca e consulta meteorológica?** Impacto: sem metas de latência, desempenho não pode ser validado objetivamente.
13. **Qual idade máxima dos dados é aceitável para clima atual e previsão?** Impacto: define quando os dados devem ser considerados desatualizados e se precisam ser sinalizados.
14. **Qual meta de disponibilidade deve ser adotada e como serão comunicadas falhas da fonte externa?** Impacto: define expectativas de confiabilidade sem atribuir ao app controle sobre um serviço externo.
15. **Como devem ser tratados termos inválidos, buscas sem resultado e falhas recuperáveis?** Impacto: determina mensagens, recuperação e consistência dos estados de erro.
16. **Quais métricas indicarão sucesso do produto, além de concluir a consulta?** Impacto: sem métricas, não será possível avaliar adoção e valor para o negócio.
17. **As três personas propostas representam os usuários prioritários e seus contextos reais?** Impacto: personas não validadas podem direcionar prioridades e decisões de UX incorretamente.

## Suposições

- A aplicação atende usuários que desejam consultar o tempo de uma cidade; segmentos prioritários ainda não foram validados.
- A busca será iniciada pelo usuário até que a necessidade de geolocalização automática seja decidida.
- Celsius/Fahrenheit se aplica à temperatura; conversão de outras medidas não está definida.
- Clima atual e previsão correspondem à cidade selecionada.
- O uso em dispositivos móveis é obrigatório, mas não exclui suporte a desktop.
- O app não terá autenticação nem persistência no servidor; isso não determina, por si só, se haverá armazenamento local.

## Personas

Personas iniciais para orientar a especificação. São hipóteses, não pesquisa validada.

| Persona | Objetivo principal | Contexto de uso | Métrica de sucesso do ponto de vista da persona |
|---|---|---|---|
| Pessoa que organiza a rotina diária | Consultar o clima da própria cidade para se preparar para o dia. | Principalmente no celular, pela manhã ou antes de sair; pode alternar unidades. | Encontra a cidade correta e entende o clima atual e a unidade em até um minuto. |
| Viajante | Consultar o clima do destino para planejar os próximos dias. | Planeja em desktop e consulta no celular durante a viagem; busca cidades diferentes da sua. | Localiza o destino correto e acessa a previsão definida para os cinco dias em uma busca. |
| Pessoa que planeja atividades ao ar livre | Consultar condições atuais e previsão para decidir quando realizar uma atividade. | Geralmente no celular, antes de sair ou enquanto está fora. | Identifica a previsão da cidade e do período desejados em até um minuto. |

As metas de tempo são propostas iniciais e devem ser validadas. A utilidade da terceira persona depende dos campos meteorológicos que serão definidos para a previsão.

## Decisões

| Decisão | Justificativa | Perguntas em aberto resolvidas |
|---|---|---|
| Usar Open-Meteo como fonte de dados, sem API key. | Simplifica a integração inicial e não exige uma chave para começar. | Define a fonte de dados. Limites, cobertura e condições de uso permanecem em aberto. |
| Interpretar “5 dias” como hoje mais os quatro dias seguintes. | Estabelece uma janela de previsão explícita. | Resolve se o dia atual está incluído. O fuso horário usado para determinar “hoje” continua em aberto. |
| Usar Celsius como unidade padrão. | Define uma apresentação inicial consistente para o público pt-BR. | Resolve a unidade inicial. Persistência da preferência e unidades além da temperatura continuam em aberto. |
| Não exigir autenticação nem persistir dados no servidor. | Mantém o escopo inicial simples e dispensa contas e armazenamento associado no servidor. | Resolve autenticação e persistência de servidor. Cache e preferências locais continuam em aberto. |
| Oferecer a interface em português do Brasil (pt-BR). | Define o idioma inicial da experiência. | Resolve o idioma da interface. Convenções de data, hora e fuso ainda precisam ser detalhadas. |
