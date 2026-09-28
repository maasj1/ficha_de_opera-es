// Itens oficiais do checklist de inspeção (24 itens).
// Fonte única de verdade: registro.html, inspecao.html e relatorios.html usam este arquivo.
// Formato: [numero, texto oficial, norma/grau]
window.ITENS = [
  [1, "Foram providenciados rádios para comunicação bilateral em trabalhos com cargas içadas nas operações dos navios na faixa do cais?", "4/M"],
  [2, "Alguma atracação/desatracação foi acompanhada? Foi observada a comunicação bilateral entre a Praticagem e Técnico de sistema, bem como uso adequado de EPI (coletes salva-vidas adequados e higienizados, capacete, luvas etc.) pelos trabalhadores de atracação?", "4/M"],
  [3, "Os guindastes de terra em operação foram verificados pelos Operadores responsáveis?", "4/M"],
  [4, "Os operadores de máquinas e equipamentos são cadastrados e habilitados para operação?", "4/M, 1/GR, 2/GR"],
  [5, "Os talhadores portuários estão escalados para as operações?", "2/T"],
  [6, "As escadas de acesso ao navio estão em condições de uso (bom estado de conservação, limpeza, guarnecida com rede protetora, pisos antiderrapantes, corrimão rígido, apoiadas em terra, dispositivo rotativo, fora do raio de ação da lança etc.)?", "4/T"],
  [7, "Foi observada a proibição do uso de extensões elétricas fixadas em escada?", "4/M"],
  [8, "Os equipamentos terrestres de guindar emitem sinais sonoros e luminosos durante o seu deslocamento?", "4/M"],
  [9, "Há possibilidade de realização simultânea de atividades em alguma operação em andamento? Caso positivo, foi informada a proibição e paralisadas as operações?", "4/M"],
  [10, "As instalações sanitárias, ao longo da faixa do cais, estão em bom estado de uso e higienização?", "3/L"],
  [11, "Foram observadas inadequações nos resíduos oriundos de movimentação portuária?", "2, 1/G"],
  [12, "Em alguma operação e/ou instalação portuária foi observado o risco efetivo de contaminação ambiental?", "1/G, 2/G"],
  [13, "Existem trabalhos de reparos (pinturas, descascamentos etc.) em costados de navios atracados? Estes foram avisados e liberados pela Gerência do porto?", "1/G"],
  [14, "Existem latas de tintas ou outras substâncias à beira do cais que possam cair no mar?", "1/G"],
  [15, "Foi registrado algum incidente/acidente nas instalações ou operações?", "4/M, 1/G, 2/G"],
  [16, "As operações portuárias acompanhadas se realizam com regularidade, segurança, eficiência e eficácia?", "5/L, 1/M, 3/M, 4/M, 1/G, 6/T"],
  [17, "Nas operações portuárias acompanhadas, os veículos (carretas) estão em boas condições de operação?", "4/M, 3/T, 4/T"],
  [18, "Os veículos e vagões utilizados para o transporte de granéis sólidos estão cobertos/enlonados para trânsito e estacionamento em área portuária?", "4/M, 5/T"],
  [19, "Foi observado o uso de quadro posicionado nas operações de movimentação de contêiner?", "4/M"],
  [20, "Os acessórios e dispositivos (anéis de carga, manilhas, sapatilhas e cabos de aço) utilizados para içamento de carga estão visivelmente em bom estado?", "4/M"],
  [21, "Nas operações envolvendo líquidos e gases inflamáveis é observado o cumprimento da NR-16 (Atividades e Operações Perigosas) e da NR-20 (Líquidos e Combustíveis Inflamáveis)?", "4/M"],
  [22, "As vias de circulação do porto estão livres e desobstruídas para a movimentação segura de passageiros vindo de Cruzeiros/Transatlântico?", "4/M"],
  [23, "Nas instalações portuárias as placas de identificação dos meios de comunicação com a ANTAQ estão visíveis e em bom estado de conservação?", "2/L"],
  [24, "Foi realizada alguma paralisação devido a situações e/ou condições de risco grave e iminente nas operações portuárias?", "1/M"]
];

// Rótulos curtos para tabelas e gráficos (relatórios).
window.ITENS_CURTO = {
  1: "Rádios em cargas içadas",
  2: "Atracação acompanhada + EPI",
  3: "Guindastes verificados",
  4: "Operadores habilitados",
  5: "Talhadores escalados",
  6: "Escadas de acesso ao navio",
  7: "Extensões elétricas em escada",
  8: "Sinais de guindastes",
  9: "Atividades simultâneas",
  10: "Instalações sanitárias",
  11: "Resíduos de movimentação",
  12: "Risco de contaminação ambiental",
  13: "Reparos em costados",
  14: "Tintas/substâncias no cais",
  15: "Incidentes/acidentes",
  16: "Regularidade e segurança",
  17: "Veículos em operação",
  18: "Granéis cobertos/enlonados",
  19: "Quadro em mov. de contêiner",
  20: "Acessórios de içamento",
  21: "NR-16 e NR-20",
  22: "Vias p/ passageiros",
  23: "Placas ANTAQ",
  24: "Paralisação por risco grave"
};
