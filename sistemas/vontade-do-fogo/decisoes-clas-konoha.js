// ══════════════════════════════════════════════════════════════════
//  A VONTADE DO FOGO — DECISÕES DE ARBITRAGEM (CLÃS DE KONOHA)
//
//  Sessenta e dois buracos da seção 3 (POR CLÃ) da auditoria, nos
//  quinze verbetes de Konoha — os catorze clãs da Folha mais o Ninja
//  Comum. Os conflitos D01–D34 e os buracos do Livro do Jogador vivem
//  em decisoes-livro.js; quando uma decisão daqui depende de uma de
//  lá, o id está citado no campo `porque`.
//
//  Nenhuma decisão aqui contraria um número impresso (P1). Onde o
//  livro disse um número, ele vale — mesmo estranho. Onde não disse
//  nada, a regra sai de um precedente citado; onde nem isso existe, a
//  entrada está marcada com confianca: 'baixa' e o `porque` diz o que
//  foi invenção.
//
//  Fontes conferidas linha a linha:
//    LJ = avdf/2b6136b4-jogador_livro.txt  (2783 linhas)
//    CC = avdf/ae88363c-clans_texto.txt    (2127 linhas)
//
// ──────────────────────────────────────────────────────────────────
//  OS SEIS PRINCÍPIOS (ver PRINCIPIOS-DE-ARBITRAGEM.md)
//
//    P1  O livro tem preferência sobre mim, sempre.
//    P2  Compêndio vence o Livro do Jogador — exceto quando quebra a
//        tabela de rank do Cap. 16.
//    P3  CD que falta = 10 + o atributo de quem aplicou.
//    P4  "Dobrado", "metade" e "+1" recebem a base na unidade que a
//        regra já usa, tirada do texto vizinho.
//    P5  Arredondamento para baixo, mínimo 1.
//    P6  Efeito nomeado e nunca descrito vira a menor coisa que
//        justifique o Estágio.
//
// ──────────────────────────────────────────────────────────────────
//  O CAMPO `aplica` — o que a ficha consome
//
//  Só existe quando a decisão vira dado. Chaves usadas neste arquivo:
//
//   tecnica / rank / pc / pcRodada / pt / dano / alcance / duracao /
//   execucao / efeito / cd
//        Correção ou complemento de uma linha do catálogo de técnicas.
//   tecnicas[]
//        Lista de correções do formato acima, aplicadas em lote.
//   tecnicaNova: { nome, rank, pc, execucao, efeito, ... }
//        Técnica que passa a existir no catálogo do clã porque um
//        Estágio a nomeia e nenhuma tabela a descreve (P6).
//   apelidoDeTecnica: { apelido, tecnica, estagio }
//        O Estágio nomeia em português uma técnica que a tabela do
//        mesmo clã traz com o nome japonês. Não cria nada: liga os
//        dois nomes para a ficha não listar uma técnica fantasma.
//   estagio: { cla, n }
//        Estágio a que a decisão se aplica, com o número romano
//        impresso na tabela de progressão.
//   passiva / fardo
//        Regra que altera a passiva ou o fardo do clã.
//   condicaoCd: [{ tecnica, atributo }]
//        Fixa qual atributo entra na fórmula CD = 10 + atributo (P3).
//   colonia / ninken / matilha / pilulas / macacos
//        Blocos próprios de um clã; o formato está no `aplica` da
//        decisão correspondente.
//   escalaEmPersonagem
//        O que acontece quando uma técnica aplica uma escala de
//        invocação (LJ:1705-1711) ao próprio personagem.
//   estColunaVazia: { tabela, valor }
//        Preenche a coluna EST. de uma tabela que a deixou em branco.
//   arredondamento / percentualPc
//        Regra de arredondamento de um percentual de recurso (P5).
// ══════════════════════════════════════════════════════════════════

const DECISOES_CLAS_KONOHA_AVDF = [

  // ════════════════════════════════════════════════════════════════
  //  UCHIHA — CC:109-209
  // ════════════════════════════════════════════════════════════════

  {
    id: 'B18',
    cla: 'uchiha',
    titulo: 'A hipnose por contato visual do Três Tomoe não tem regra nenhuma',
    onde: 'CC:134-135 · CC:2041-2042 · CC:163-166 · LJ:1395-1397',
    tipo: 'termo',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:134-135 (Estágio III) — "Três Tomoe. Cópia de técnicas, hipnose por contato '
      + 'visual, Vantagem para interromper jutsus." · CC:2041-2042 repete: "Domínio '
      + 'completo. Cópia (...), hipnose por contato visual, e Vantagem para interromper '
      + 'jutsus." Nenhum dos dois volumes diz custo, ação, CD, atributo resistido, duração '
      + 'ou limite de usos.',
    decisao:
      'Hipnose por contato visual · rank C · 4 PC · Ação Menor · exige o Sharingan de Três '
      + 'Tomoe ativo e linha de visão desimpedida com um alvo na zona Contato ou Curta que '
      + 'possa ver os seus olhos. Role d20 + GEN contra a Resiliência Mental do alvo '
      + '(10 + ESP). Sucesso: o alvo fica Sob Ilusão com profundidade 1, percebendo a cena '
      + 'falsa que o Uchiha descreve em uma frase. Sai pelo Kai normal (ESP no fim de cada '
      + 'turno contra 10 + GEN do Uchiha). Não planta ordens — isso é o Magen: Sharingan. '
      + 'Sem limite de usos além do PC gasto. Fechar os olhos ou bloquear o vetor visual '
      + 'impede a técnica, como em qualquer genjutsu.',
    porque:
      'P6 e P4. A moldura inteira já existe: o Cap. 19 (LJ:1395-1397) define lançamento '
      + '(d20 + GEN vs Resiliência Mental), camadas (1 a 3) e Kai (10 + GEN), então nada '
      + 'aqui é numérico novo. O rank sai do vizinho, não do framework: o Estágio III do '
      + 'Uchiha nomeia três coisas, e as duas que a tabela estatiza são de rank C — '
      + 'Sharingan: Kopī, C · 4 (CC:163-164), que é a "Cópia de técnicas" da mesma linha. '
      + 'A hipnose fica no mesmo degrau. E a profundidade tem de ser 1, porque a técnica '
      + 'comprável do mesmo Estágio, Magen: Sharingan (B · 7, CC:166-167), vende '
      + 'exatamente "profundidade 2 e uma ordem plantada" — a versão de graça não pode '
      + 'igualar a versão paga. INVENÇÃO MINHA: o alcance Curta, que nenhum texto declara; '
      + 'escolhi o menor alcance compatível com "contato visual" que ainda não seja só '
      + 'Contato, porque o Magen: Sharingan também não declara alcance e o dōjutsu enxerga '
      + 'a Longa.',
    principio: 'P6',
    confianca: 'baixa',
    aplica: {
      tecnicaNova: {
        nome: 'Hipnose por Contato Visual',
        rank: 'C',
        pc: 4,
        execucao: 'Ação Menor',
        acerto: 'gen',
        resistido: 'resiliencia_mental',
        alcance: 'Curta',
        efeito: 'Sob Ilusão, profundidade 1. Sai por Kai (ESP vs 10 + GEN).',
        requisito: 'sharingan_tres_tomoe_ativo',
        gratuita: true,
      },
      estagio: { cla: 'uchiha', n: 'III' },
    },
  },

  {
    id: 'C15',
    cla: 'uchiha',
    titulo: 'O Susanoo do Compêndio não diz PV do avatar nem duração',
    onde: 'CC:178-181 · LJ:1963-1964 · LJ:480-481',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:178-181 — "Susanoo · S · 16+6/rd · Avatar de chakra. Estágios: costelas (red. '
      + '10) → torso (red. 20, 6d6) → armadura (red. 30, 8d6) → Completo (invocação '
      + 'Colossal)." Sem PV do avatar e sem número de rodadas.',
    decisao:
      'O avatar não tem PV próprios e não concede PV extra: a durabilidade dele é a '
      + 'redução de dano (10 / 20 / 30), conforme decidido em D08. E não tem duração '
      + 'máxima: é uma Sustentada e dura enquanto o Uchiha paga a manutenção por rodada '
      + '(6 / 8 / 10 / 12 PC, D08). Encerra quando ele deixa de pagar, fica Selado, cai a '
      + '0 PV, ou falha no teste de concentração de CTR CD 10 + dano sofrido. Cada rodada '
      + 'em que o Susanoo estiver ativo continua acumulando Cegueira pela regra de CC:195 '
      + '— 1 ponto por uso da técnica, não por rodada.',
    porque:
      'P1 e a decisão D08, que já resolveu a estrutura do Susanoo e cravou pvExtra 0. Para '
      + 'a duração não há o que arbitrar: LJ:480-481 define Sustentada como a categoria que '
      + '"permanece ativa enquanto você paga a manutenção por rodada" e já traz a condição '
      + 'de perda ("Sofrer dano exige teste de CTR, CD 10 + dano"). A auditoria leu como '
      + 'lacuna uma regra que o Cap. 8 tinha declarado para a categoria inteira.',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      tecnica: 'susanoo',
      pvAvatar: 0,
      duracao: 'enquanto pagar a manutenção',
      encerraPor: ['nao_pagar', 'selado', '0_pv', 'falha_ctr_cd_10_mais_dano'],
      cegueiraPorUso: 1,
    },
  },

  {
    id: 'F13',
    cla: 'uchiha',
    titulo: 'O Fardo Uchiha falha "não conseguir parar" sem dizer o que acontece',
    onde: 'CC:205-207 · CC:1005-1006 · CC:195-198',
    tipo: 'gatilho',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'CC:205-207 — "ao ativar o Mangekyō contra alguém que ele conhece pessoalmente, '
      + 'teste ESP CD 15 — a falha significa que ele não consegue parar quando deveria."',
    decisao:
      'Na falha do ESP CD 15: até o fim da cena, o Uchiha não pode desativar o Mangekyō '
      + 'voluntariamente nem trocar de alvo, e no início de cada turno seu ele precisa '
      + 'usar uma técnica Mangekyō contra aquele alvo se tiver PC e ação para isso. Cada '
      + 'uso acumula Cegueira normalmente (CC:195-198), e é aí que dói. Termina antes da '
      + 'cena se o alvo cair a 0 PV, sair da linha de visão por uma rodada inteira, ou se '
      + 'o Uchiha ficar Selado, Atordoado ou sem PC para pagar a técnica. Aliados podem '
      + 'interromper: um aliado que gaste 1 PVF em Proteger (LJ:328) e receba o golpe no '
      + 'lugar do alvo encerra o estado imediatamente. O Mestre não assume a ficha — a '
      + 'restrição é sobre desligar e sobre escolher outro alvo, não sobre o resto do '
      + 'turno.',
    porque:
      'P4: a base sai do texto vizinho na mesma unidade, e o vizinho aqui é o Fardo do '
      + 'clã Kurama (CC:1005-1006), que usa o mesmo gatilho e o mesmo número — "teste ESP '
      + 'CD 15. Na falha, o Mestre controla parcialmente o seu personagem por uma cena". A '
      + 'duração "uma cena" vem literalmente de lá. A tradução para regra é o que o próprio '
      + 'clã já cobra: o custo real do Mangekyō é a Cegueira acumulada (CC:195-198, "uma '
      + 'luta difícil consome três usos"), então "não conseguir parar" só tem peso '
      + 'mecânico se for obrigação de continuar gastando. A saída pelo PVF é a que LJ:328 '
      + 'já oferece para qualquer ataque, sem regra nova.',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      fardo: {
        cla: 'uchiha',
        gatilho: 'ativar Mangekyō contra alguém que conhece pessoalmente',
        teste: { atributo: 'esp', cd: 15 },
        naFalha: {
          duracao: 'cena',
          naoPodeDesativar: true,
          naoPodeTrocarDeAlvo: true,
          obrigaTecnicaMangekyoPorTurno: true,
          acumulaCegueiraPorUso: 1,
          encerraPor: ['alvo_a_0_pv', 'fora_de_visao_1_rodada', 'selado', 'atordoado', 'sem_pc', 'aliado_gasta_pvf_proteger'],
        },
      },
    },
  },

  // ════════════════════════════════════════════════════════════════
  //  HYŪGA — CC:211-290
  // ════════════════════════════════════════════════════════════════

  {
    id: 'A19',
    cla: 'hyuga',
    titulo: 'O Jūken causa "metade do dano" e não se diz metade de quê',
    onde: 'CC:228-229 · LJ:1482-1483 · CC:261-262 · LJ:2096',
    tipo: 'grandeza',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:228-229 (Estágio I) — "Estilo Jūken: golpes causam metade do dano, drenam 1d6 PC '
      + 'e ignoram redução por armadura." · LJ:1482-1483 (Postura do estilo) — "dano pela '
      + 'metade, mas drena 1d6 PC e ignora Defesa por armadura".',
    decisao:
      'A redução à metade incide sobre o dano total já rolado do ataque — dados mais TAI '
      + 'mais qualquer bônus —, arredondado para baixo, mínimo 1, e é aplicada antes de '
      + 'qualquer redução do alvo. Um Hyūga com TAI +5 que role 4 num soco desarmado causa '
      + '(4 + 5) ÷ 2 = 4 de dano e drena 1d6 PC. A metade vale apenas para os ataques '
      + 'básicos cobertos pela Postura (desarmado e arma branca); as técnicas Hakke e Jūken '
      + 'do catálogo trazem o próprio dano impresso (2d6+TAI, 5d6+TAI, 8d6+TAI) e esse '
      + 'número não é dividido. O Jūkenpō: Shōkyaku suspende a metade nos ataques básicos '
      + 'por 3 rodadas.',
    porque:
      'P5 dá o arredondamento; P4 dá a base. "Metade do dano" tem uma leitura só no livro: '
      + 'LJ:2096 (selo explosivo) — "2d6 em uma zona; teste de COR CD 13 reduz à metade" — '
      + 'e CC:1049-1050 (Kage Fūma Shuriken) — "alvos que Esquivarem ainda sofrem metade" '
      + '— sempre sobre o dano rolado, nunca sobre uma parcela dele. A separação entre '
      + 'ataque básico e técnica não é minha: é o próprio Compêndio que a declara, em '
      + 'CC:261-262, ao vender o Jūkenpō: Shōkyaku como "ataques de Jūken (...) causam dano '
      + 'cheio além da drenagem" — só faz sentido se o dano cheio for exatamente o que a '
      + 'Postura tirava, e as técnicas com dano impresso continuassem valendo o impresso '
      + '(P1).',
    principio: 'P4',
    confianca: 'alta',
    aplica: {
      estilo: 'juken',
      metadeDoDano: {
        incideSobre: 'dano total rolado (dados + atributo + bônus)',
        antesDaReducaoDoAlvo: true,
        arredonda: 'baixo',
        minimo: 1,
        apenasAtaquesBasicos: true,
        tecnicasComDanoImpressoNaoDividem: true,
        suspensoPor: 'jukenpo_shokyaku',
      },
    },
  },

  {
    id: 'B17',
    cla: 'hyuga',
    titulo: '"Ler selos alheios com o Byakugan" não diz teste nem CD',
    onde: 'CC:239-240 · CC:221-222 · LJ:1312 · LJ:2341 · LJ:493-502',
    tipo: 'termo',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'CC:239-240 (Estágio IV) — "Hakke Rokujūyon Shō e ler selos alheios com o Byakugan." '
      + '· CC:221-222 (Passiva) — o Byakugan já "visualiza a rede de chakra de qualquer '
      + 'alvo: PC atuais, quais clones são reais, se está sob genjutsu, e selos ou '
      + 'implantes no corpo".',
    decisao:
      'Com o Byakugan ativo, ler um selo é Ação Menor, sem custo de PC além do 1 PC/rodada '
      + 'do dōjutsu, contra um selo à vista até Média (o alcance de visão através de '
      + 'matéria da Passiva). Role Fūinjutsu (CTR) contra CD pela categoria de acesso do '
      + 'selo: 12 para Livre e Restrito, 16 para Hiden e Kekkei Genkai, 20 para Kinjutsu e '
      + 'Ōgi. Sucesso: você sabe o que o selo faz, o que o dispara e o que o desfaz; '
      + 'Decisivo: sabe também quem o desenhou. Isto não substitui nem concede a perícia '
      + 'Fūinjutsu — quem não a tem rola sem treino (+0). O Estágio IV não permite alterar '
      + 'nem quebrar o selo: para isso continuam valendo as técnicas do Cap. 18.',
    porque:
      'P4 em dois passos, sem inventar número. O atributo e a perícia são os que o próprio '
      + 'sistema fixou para tudo que envolva selo: LJ:1312 — "Toda técnica usa Controle e a '
      + 'perícia Fūinjutsu". Os CDs saem da escala publicada em LJ:2341 ("8 fácil · 12 '
      + 'média · 16 difícil · 20 muito difícil"), degrau a degrau, indexados pela única '
      + 'classificação de dificuldade que o livro dá a uma técnica: o acesso (LJ:493-502). '
      + 'Não escolhi um número novo: escolhi qual degrau da régua existente cada categoria '
      + 'ocupa. O alcance Média é literal da Passiva (CC:221).',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      estagio: { cla: 'hyuga', n: 'IV' },
      lerSelos: {
        execucao: 'Ação Menor',
        pc: 0,
        requer: 'byakugan_ativo',
        alcance: 'Média',
        teste: { pericia: 'fuinjutsu', atributo: 'ctr' },
        cdPorAcesso: { livre: 12, restrito: 12, hiden: 16, kekkei_genkai: 16, kinjutsu: 20, ogi: 20 },
        concedePericia: false,
        permiteAlterar: false,
      },
    },
  },

  {
    id: 'C19',
    cla: 'hyuga',
    titulo: 'Sōshiken é Sustentada e não declara duração máxima',
    onde: 'CC:281-283 · LJ:480-481',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:281-283 — "Sōshiken · S · 16 · Os leões ganham autonomia. Enquanto ativo (6 '
      + 'PC/rd), um ataque de Jūken adicional por rodada, e alvos em Contato perdem 1d6 PC '
      + 'no fim do turno deles."',
    decisao:
      'Sōshiken não tem duração máxima: dura enquanto o Hyūga pagar 6 PC no início de cada '
      + 'turno seu. Encerra quando ele deixa de pagar, fica Selado ou Exausto de Chakra, ou '
      + 'falha num teste de CTR CD 10 + dano sofrido depois de levar dano. O ataque de '
      + 'Jūken adicional por rodada não é uma Ação Principal extra: é um ataque a mais '
      + 'dentro do turno, e soma o TAI uma vez só, junto com os demais ataques do turno '
      + '(regra 4 do Apêndice, LJ:2424-2426, aplicada em D32).',
    porque:
      'P1. Não há lacuna: LJ:480-481 define a categoria — "Sustentada: permanece ativa '
      + 'enquanto você paga a manutenção por rodada. Sofrer dano exige teste de CTR (CD 10 '
      + '+ dano) para não perder a concentração". CORREÇÃO DA AUDITORIA: o achado afirma '
      + 'que "todas as outras Sustentadas do livro dizem quantas rodadas", e isso é falso — '
      + 'Kagemane (CC:464), Kagekubi Shibari (CC:476), Baika no Jutsu (CC:531), Shinshin no '
      + 'Jutsu (CC:620), Adamantine Fūsa: Rō (CC:415), Mushi Jamu (CC:747) e Suirō no Jutsu '
      + '(LJ:894) são todas Sustentadas sem duração declarada. O padrão do livro é '
      + 'justamente não declarar, porque a regra de categoria já cobre.',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      tecnica: 'soshiken',
      pcRodada: 6,
      duracao: 'enquanto pagar a manutenção',
      encerraPor: ['nao_pagar', 'selado', 'exausto_de_chakra', 'falha_ctr_cd_10_mais_dano'],
      ataqueAdicional: { acaoExtra: false, somaAtributoUmaVez: true },
    },
  },

  {
    id: 'F10',
    cla: 'hyuga',
    titulo: 'Selado "permanentemente" e o que é um "médico de elite"',
    onde: 'CC:278-280 · CC:267-268 · LJ:691-692 · LJ:721 · LJ:209',
    tipo: 'gatilho',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:278-280 — "Hakke Hyakunijūhachi Shō · S · 16 · 128 golpes em todos os tenketsu: '
      + '8d6+TAI, alvo Selado permanentemente (só médico de elite reverte) e sem Reação '
      + 'durante a sequência." · LJ:691-692 — "Selado: (...) Como sair: CTR no fim de cada '
      + 'turno, CD do efeito."',
    decisao:
      'O alvo fica Selado e, ao contrário de todo outro Selado do livro, não faz o teste de '
      + 'CTR no fim do turno: a condição não expira sozinha, nem com descanso, nem com o '
      + 'fim da cena. Reverter exige duas semanas de tratamento contínuo e um teste de '
      + 'Medicina (CTR) CD 20 feito por um personagem com a perícia Medicina no grau Mestre '
      + '(+6) — é isso que "médico de elite" significa. Falha: novo teste depois de outras '
      + 'duas semanas. "Sem Reação durante a sequência" dura até o fim do turno seguinte do '
      + 'alvo. A técnica não impede Testes de Morte nem cura mundana: o alvo continua vivo, '
      + 'só não usa chakra.',
    porque:
      'P4. Cada peça sai de um lugar impresso. "Médico de elite" só pode ser um grau de '
      + 'perícia, e o livro tem três (LJ:209: Treinado, Especialista, Mestre) — Mestre é o '
      + 'topo e exige rank Jōnin, que é a leitura mais próxima de "elite". O procedimento é '
      + 'copiado do único procedimento de reversão de dano permanente que o livro escreve, '
      + 'LJ:721: "Ferimento Grave — efeito até tratamento (2 sem. + Medicina CD 16)"; '
      + 'mantive as duas semanas e subi o CD para 20 porque a técnica irmã do mesmo clã, '
      + 'Hakke Rokujūyon Shō (CC:267-268), já declara CD 20 para o seu Selado, e 20 é o '
      + 'degrau "muito difícil" da régua de LJ:2341. Nada aqui é número novo.',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      tecnica: 'hakke_hyakunijuhachi_sho',
      selado: { permanente: true, testeDeSaidaPorTurno: false },
      reversao: { tempo: '2 semanas', teste: { pericia: 'medicina', atributo: 'ctr', cd: 20 }, exige: 'medicina_mestre', repetivel: 'a cada 2 semanas' },
      semReacao: 'até o fim do turno seguinte do alvo',
    },
  },

  // ════════════════════════════════════════════════════════════════
  //  SENJU — CC:292-357
  // ════════════════════════════════════════════════════════════════

  {
    id: 'A08',
    cla: 'senju',
    titulo: 'O Karyūdan pode ser trocado por uma técnica "equivalente" que ninguém nomeia',
    onde: 'CC:334-335 · LJ:877-880 · LJ:964-966 · LJ:1020-1023 · LJ:2559-2562',
    tipo: 'grandeza',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:334-335 — "Katon: Karyūdan · C · 4 · Jato de fogo compacto, 2d6+NIN. O clã ensina '
      + 'uma técnica de cada natureza — troque por Suiton, Fūton, Raiton ou Doton '
      + 'equivalente."',
    decisao:
      '"Equivalente" quer dizer: mesma linha de ficha — rank C, 4 PC, 2d6+NIN, acesso '
      + 'Livre. A ficha oferece cinco opções e o jogador marca uma na compra do Estágio II; '
      + 'a escolha é definitiva. Katon: Karyūdan (CC:334) · Suiton: Mizurappa (LJ:877-880) '
      + '· Fūton: Daitoppa (LJ:964-966) · Raiton: Jibashi (LJ:1020-1023) · Doton: Doryūsō '
      + '(LJ:2559-2562). Vale o efeito impresso de cada uma, inclusive os efeitos '
      + 'colaterais que elas trazem e o Karyūdan não tem. A troca não exige dominar a '
      + 'natureza escolhida: a linha do clã é o que a concede para esta técnica, e só para '
      + 'ela.',
    porque:
      'P4: a base sai do texto vizinho, na mesma unidade. A unidade aqui é a linha de '
      + 'ficha, e o Karyūdan a declara inteira — C · 4 · 2d6+NIN. Cada uma das quatro '
      + 'naturezas citadas tem exatamente uma técnica de ataque com essa linha idêntica no '
      + 'catálogo do Livro do Jogador, e nenhuma tem duas; "equivalente" não precisou ser '
      + 'interpretado, só procurado. A dispensa da natureza é P1 lido ao contrário: '
      + 'LJ:431 proíbe aprender jutsu de natureza que você não domina, e a Passiva Senju '
      + '(CC:302) já quebra essa proibição uma vez ("Trate todo jutsu de acesso Livre como '
      + 'da sua natureza afim") — as quatro alternativas são todas de acesso Livre, então a '
      + 'Passiva as cobre sem que eu precise abrir exceção nenhuma.',
    principio: 'P4',
    confianca: 'alta',
    aplica: {
      tecnica: 'katon_karyudan',
      escolhaNaCompra: true,
      definitiva: true,
      opcoes: [
        { natureza: 'katon', tecnica: 'katon_karyudan', rank: 'C', pc: 4, dano: '2d6+NIN' },
        { natureza: 'suiton', tecnica: 'mizurappa', rank: 'C', pc: 4, dano: '2d6+NIN' },
        { natureza: 'futon', tecnica: 'daitoppa', rank: 'C', pc: 4, dano: '2d6+NIN' },
        { natureza: 'raiton', tecnica: 'jibashi', rank: 'C', pc: 4, dano: '2d6+NIN' },
        { natureza: 'doton', tecnica: 'doryuso', rank: 'C', pc: 4, dano: '2d6+NIN' },
      ],
      exigeNatureza: false,
    },
  },

  {
    id: 'C01',
    cla: 'senju',
    titulo: 'A tabela de Mokuton tem coluna EST. e nenhuma linha preenchida',
    onde: 'CC:1985-2003 · CC:322-324 · LJ:367-374',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:1985 — cabeçalho "TÉCNICA · RK · PC · EFEITO · EST." · CC:1986-2003 — as oito '
      + 'linhas (Mokuton: Jōgan C 4 · Mokujōheki B 7 · Daijurin B 7 · Shichūka B 7 · '
      + 'Kajukai Kōrin A 11 · Hōbi A 11 · Mokuryū S 16 · Shin Sūsenju S tudo) com a coluna '
      + 'EST. em branco · CC:322-324 (Senju, Estágio V) — "Mokuton (Cap. 29), ou, se o '
      + 'Mestre negar, Sōzō Saisei e o Byakugō no In."',
    decisao:
      'EST. = V em todas as oito linhas. A tabela de Mokuton não tem progressão interna '
      + 'porque o Mokuton inteiro é destravado de uma vez, por um único Estágio. A partir '
      + 'do Estágio V do Senju (ou do transplante de CC:1979-1981, com as penalidades de '
      + 'lá), todas as oito técnicas ficam disponíveis para compra, e o que escalona qual '
      + 'delas o personagem pode usar é o rank de ninja, pela validação de D29: Chūnin até '
      + 'B, Jōnin até A, Elite até S. Na prática, um Senju que compre o Estágio V já é '
      + 'Elite (CC:322) e alcança a tabela inteira; o gargalo real é o PT, não o Estágio.',
    porque:
      'P4 e D29. A coluna vazia não é um número perdido: é a coluna de uma tabela que não '
      + 'tem o que colocar nela, porque a única porta de entrada do Mokuton é o Estágio V — '
      + 'o Compêndio diz isso em CC:322-324 e não oferece nenhuma outra. Preencher com '
      + 'estágios inventados criaria uma progressão que o Senju não tem: ele não compra '
      + 'Estágio VI. E a segunda trava já estava escrita e já foi aplicada em D29 — o rank '
      + 'mínimo de ninja por rank de técnica (LJ:367-374) —, que é exatamente o que '
      + 'impede um Mokuryū de rank S de aparecer cedo demais.',
    principio: 'P4',
    confianca: 'alta',
    aplica: {
      estColunaVazia: { tabela: 'mokuton', valor: 'V' },
      mokuton: {
        destravadoPor: ['senju_estagio_v', 'transplante_cc_1979'],
        gargalo: 'rank de ninja (D29) e PT',
      },
    },
  },

  {
    id: 'C08-senju',
    cla: 'senju',
    titulo: 'A Vontade de Fogo Herdada pode ultrapassar o teto de PVF dos aliados',
    onde: 'CC:316-317 · LJ:320-321 · LJ:332 · LJ:2037',
    tipo: 'numero',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'CC:316-317 (Estágio III) — "Vontade de Fogo Herdada. 1×/sessão, conceda a todos os '
      + 'aliados à vista 1 PVF."',
    decisao:
      'O PVF concedido pelo Senju respeita o teto de cada aliado, e o teto de cada aliado é '
      + 'o valor inicial de sessão dele, conforme decidido em C08 — 3 para o padrão, 4 para '
      + 'um personagem de Konoha, 5 para um Sarutobi de Konoha. Um aliado que já esteja no '
      + 'teto não ganha nada, e o uso não é desperdiçado para os demais. A concessão é ação '
      + 'livre e não custa PVF do Senju (ao contrário da Passiva Sarutobi, CC:771, que sai '
      + 'do bolso dele).',
    porque:
      'Depende de C08 (decisoes-livro.js), que fixou "o teto de PVF de um personagem é '
      + 'igual ao seu valor inicial de sessão". Aplicar aqui é só ler a regra já tomada: '
      + 'nenhum efeito do livro cria PVF acima do teto, e a alternativa — deixar o Senju '
      + 'estourar tetos — daria a um Estágio de 8 PT o poder de furar a única economia que '
      + 'o jogo declara pessoal e não acumulável (LJ:321). P1 também aponta para cá: o '
      + 'texto do Estágio diz "conceda 1 PVF", não "acima do máximo".',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      estagio: { cla: 'senju', n: 'III' },
      pvf: { concede: 1, alvo: 'todos os aliados à vista', porSessao: 1, respeitaTeto: true, custoParaOSenju: 0, execucao: 'ação livre' },
    },
  },

  // ════════════════════════════════════════════════════════════════
  //  UZUMAKI — CC:360-429
  // ════════════════════════════════════════════════════════════════

  {
    id: 'A05',
    cla: 'uzumaki',
    titulo: 'Selos de Sangue prepara "o dobro de selos" e a base usa "rank" como número',
    onde: 'CC:375 · LJ:1312-1313 · LJ:2465',
    tipo: 'grandeza',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:375 (Estágio I) — "Selos de Sangue. Você prepara o dobro de selos por vez." · '
      + 'LJ:1312-1313 — "Selos são preparados fora de combate: você pode ter no máximo '
      + 'CTR + rank selos preparados por vez."',
    decisao:
      'Limite de selos preparados de um Uzumaki de Estágio I ou acima = 2 × (CTR + rank '
      + 'numérico), com o rank numérico da tabela de A22: Estudante 0 · Genin 1 · Chūnin 2 '
      + '· Jōnin Especial 3 · Jōnin 4 · Elite e acima 5. Um Uzumaki Chūnin com CTR +4 '
      + 'prepara 12 selos; um Genin com CTR +3, 8. O dobro incide sobre a soma inteira, não '
      + 'só sobre o CTR, porque a frase do livro dobra "selos", que é o resultado da soma. '
      + 'O tempo e o custo de preparação não dobram nem caem: continuam dez minutos e o PC '
      + 'pago na preparação (LJ:1313).',
    porque:
      'P4 para a leitura do dobro e a decisão A22 (decisoes-livro.js) para o número do '
      + 'rank — ela já converteu "rank" em valor para toda fórmula dos dois livros que o '
      + 'escreva como número, e nomeou "selos_preparados" entre os usos. Dobrar só o CTR '
      + 'seria inventar um parêntese que a frase não tem: o livro escreve "o dobro de '
      + 'selos", e a quantidade de selos é CTR + rank.',
    principio: 'P4',
    confianca: 'alta',
    aplica: {
      estagio: { cla: 'uzumaki', n: 'I' },
      selosPreparados: { formula: '2 × (CTR + rankNumerico)', dobraSomaInteira: true, tempoPreparo: '10 min', pcNaPreparacao: true },
    },
  },

  {
    id: 'A14',
    cla: 'uzumaki',
    titulo: 'O Uzumaki de Estágio V "sobrevive debilitado" ao Hakke no Fūin Shiki',
    onde: 'CC:420-422 · LJ:709-716 · LJ:721-727',
    tipo: 'termo',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'CC:420-422 — "Hakke no Fūin Shiki · S · 16 · Sela um bijū num hospedeiro. Ritual de '
      + 'horas e a vida de quem o aplica — exceto um Uzumaki de Estágio V, que sobrevive '
      + 'debilitado."',
    decisao:
      '"Debilitado" passa a ter ficha: terminado o ritual, o Uzumaki de Estágio V fica com '
      + '1 PV, 0 PC, Exaustão 4 e o Ferimento Grave "Rede de chakra danificada" (PC máximos '
      + 'reduzidos em 25%). A Exaustão sai pelo descanso normal, um nível por noite; o '
      + 'Ferimento Grave só sai com duas semanas de tratamento e Medicina CD 16 (LJ:721), e '
      + 'enquanto durar bloqueia um novo Hakke no Fūin Shiki. Um Uzumaki abaixo do Estágio '
      + 'V continua morrendo, como o texto diz.',
    porque:
      'P4: o livro só tem dois vocabulários para "vivo, mas quebrado", e os dois estão no '
      + 'mesmo capítulo — Exaustão (LJ:709-716) e Ferimento Grave (LJ:721-727). Usei os '
      + 'dois em vez de criar uma condição nova. A escolha dos valores não é arbitrária: '
      + 'Exaustão 4 é o último nível antes da inconsciência (LJ:714-715), isto é, o mais '
      + 'debilitado que um personagem pode ficar continuando de pé, e "Rede de chakra '
      + 'danificada" é o único Ferimento Grave da tabela que fala de chakra — que é '
      + 'exatamente o que o ritual consome. INVENÇÃO MINHA: 1 PV e 0 PC, que nenhum texto '
      + 'declara; escolhi os dois mínimos possíveis sem matar o personagem, porque a regra '
      + 'que estou substituindo é literalmente "custa a vida".',
    principio: 'P4',
    confianca: 'baixa',
    aplica: {
      tecnica: 'hakke_no_fuin_shiki',
      sobrevivenciaEstagioV: {
        pv: 1,
        pc: 0,
        exaustao: 4,
        ferimentoGrave: 'rede_de_chakra_danificada',
        tratamento: '2 semanas + Medicina CD 16',
        bloqueiaNovoUso: true,
      },
      abaixoDoEstagioV: 'morte',
    },
  },

  {
    id: 'A23',
    cla: 'uzumaki',
    titulo: '"Recupera o dobro em qualquer descanso" e metade dos descansos já dá tudo',
    onde: 'CC:368 · LJ:381-384 · LJ:2369 · LJ:2361',
    tipo: 'grandeza',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'CC:368 (Passiva) — "+50% de PC máximos e +10 PV. Recupera o dobro em qualquer '
      + 'descanso (...)" · LJ:2369 — "Descanso: Respiro 10 min (PC = ESP + rank) · Pausa 4 '
      + 'h (metade) · Noite (todo PC, metade dos PV, −1 Exaustão) · Vila 3 dias (tudo)."',
    decisao:
      'O dobro incide sobre as quantidades de PV e PC recuperadas, e só sobre elas. '
      + 'Respiro: 2 × (ESP + rank) em PC. Pausa de 4 h: metade dobrada, ou seja, PC e PV '
      + 'cheios. Noite: todo o PC (já era tudo, o dobro não acrescenta) e PV cheios em vez '
      + 'de metade. Vila 3 dias: já era tudo. A remoção de Exaustão NÃO dobra: continua 1 '
      + 'nível por noite e tudo no repouso de vila. Onde o dobro passaria do máximo, para '
      + 'no máximo — não gera PV nem PC temporários.',
    porque:
      'P4 e P1. O livro separa dois verbos e a passiva usa só um: LJ:2369 e LJ:381-384 '
      + 'escrevem "recupera" para PC e PV, e LJ:2361 escreve "remove" para Exaustão — '
      + '"Uma noite de sono remove 1 nível". A Passiva Uzumaki diz "Recupera o dobro", '
      + 'então alcança o que o livro chama de recuperar e não alcança o que ele chama de '
      + 'remover. Isso não é escolha estética: é a única leitura em que a frase tem um '
      + 'referente escrito. O teto vem de P1 — nenhum descanso do livro passa do máximo, e '
      + 'PV/PC temporários existem só onde uma técnica os concede por nome (CC:533, '
      + 'CC:1827).',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      passiva: {
        cla: 'uzumaki',
        descansoDobrado: {
          respiro: '2 × (ESP + rankNumerico) PC',
          pausa4h: 'PC e PV cheios',
          noite: 'PC cheio, PV cheio',
          vila3dias: 'tudo',
          exaustao: 'não dobra',
          limitadoAoMaximo: true,
        },
      },
    },
  },

  {
    id: 'A24',
    cla: 'uzumaki',
    titulo: '"+50% de PC máximos" sem regra de arredondamento',
    onde: 'CC:368 · LJ:201 · LJ:714 · CC:1356 · CC:1894',
    tipo: 'numero',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'CC:368 — "+50% de PC máximos e +10 PV." · LJ:201 — "Pontos de Chakra (PC) = 12 + '
      + '(ESP × 3) + bônus de rank."',
    decisao:
      'O bônus percentual é calculado sobre o PC máximo já somado — base, ESP e bônus de '
      + 'rank — e arredondado para baixo, com mínimo de 1 ponto ganho. Um Uzumaki Chūnin '
      + 'com ESP +4 (12 + 12 + bônus de rank) que chegue a 31 PC máximos recebe +15, indo a '
      + '46. A ordem é fixa: primeiro somam-se todos os bônus fixos de PC (rank, clã, '
      + 'talentos), depois se aplica o percentual, uma única vez. Percentuais de fontes '
      + 'diferentes não se multiplicam entre si: cada um lê a mesma base e os resultados se '
      + 'somam.',
    porque:
      'P5, literal, e o precedente é o que o próprio princípio cita: LJ:714 manda reduzir '
      + '"PV máximos à metade" na Exaustão 4 sem dizer como arredondar, e a ficha não pode '
      + 'exibir 17,5. A ordem de aplicação vem de P1 pela leitura da fórmula: LJ:201 define '
      + 'PC máximo como uma soma fechada, então "50% de PC máximos" só pode ser 50% do '
      + 'resultado dessa soma. A não multiplicação entre percentuais é a leitura que mantém '
      + 'os três clãs percentuais do livro (Uzumaki +50%, Hoshigaki +40% em CC:1356, '
      + 'Tsuchigumo +30% em CC:1894) na mesma escala, e nenhum deles se acumula com outro '
      + 'na prática — nenhum personagem tem dois.',
    principio: 'P5',
    confianca: 'alta',
    aplica: {
      percentualPc: { uzumaki: 0.5, base: 'pc_maximo_apos_bonus_fixos', arredonda: 'baixo', minimoGanho: 1, multiplicaEntreSi: false },
      arredondamento: { regra: 'para baixo, mínimo 1' },
    },
  },

  {
    id: 'C20',
    cla: 'uzumaki',
    titulo: 'Adamantine Fūsa: Rō é uma prisão sem CD, sem teste e sem saída escrita',
    onde: 'CC:415-418 · CC:406-407 · LJ:687-688 · LJ:480-481',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:415-418 — "Adamantine Fūsa: Rō · A · 11+4/rd · Sustentada. Jaula esférica em '
      + 'torno de um alvo colossal: nem invocações Colossais nem um bijū em Modo Bijū agem. '
      + 'Você fica imóvel." · CC:406-407 (a técnica irmã) — "Kongō Fūsa · A · 11 · (...) '
      + 'Prendem qualquer criatura, inclusive um bijū: Preso e Selado (CD 20)."',
    decisao:
      'O alvo fica Preso e Selado, CD 20. Ele testa uma vez por rodada, como Ação Principal '
      + '(TAI ou COR contra 20 para o Preso, CTR contra 20 no fim do turno para o Selado, '
      + 'pelas regras normais das duas condições). Enquanto estiver Preso pela jaula, uma '
      + 'invocação Colossal ou um bijū em Modo Bijū não age — nem ataque, nem movimento, '
      + 'nem técnica. A jaula se rompe quando o alvo vence o CD 20, quando o Uzumaki deixa '
      + 'de pagar 4 PC por rodada, quando ele é movido à força da posição em que ficou '
      + 'imóvel, ou quando falha num teste de CTR CD 10 + dano sofrido. Não há duração '
      + 'máxima.',
    porque:
      'P4 e P1: a base sai do vizinho mais próximo possível, que é a outra técnica de '
      + 'corrente do mesmo clã, no mesmo rank A e com o mesmo par de condições — Kongō Fūsa '
      + '(CC:406-407), "Preso e Selado (CD 20)". Copiar o CD dela não é arbitrar, é ler o '
      + 'número que o clã já publicou para o efeito idêntico. A cadência dos testes é a das '
      + 'próprias condições (LJ:687-688 e LJ:691-692), e as demais condições de ruptura são '
      + 'as da categoria Sustentada (LJ:480-481). A leitura oposta — prisão sem saída — '
      + 'contraria a regra 5 do Apêndice, que existe para impedir que uma linha de texto '
      + 'encerre o combate sozinha.',
    principio: 'P4',
    confianca: 'alta',
    aplica: {
      tecnica: 'adamantine_fusa_ro',
      cd: 20,
      condicoes: ['preso', 'selado'],
      testePorRodada: true,
      pcRodada: 4,
      duracao: 'enquanto pagar a manutenção',
      encerraPor: ['alvo_vence_cd_20', 'nao_pagar', 'usuario_movido_a_forca', 'falha_ctr_cd_10_mais_dano'],
    },
  },

  // ════════════════════════════════════════════════════════════════
  //  NARA — CC:431-499
  // ════════════════════════════════════════════════════════════════

  {
    id: 'E01',
    cla: 'nara',
    titulo: '"CTR vs Vontade" — "Vontade" não é atributo, valor derivado nem perícia',
    onde: 'CC:466 · CC:412-413 · LJ:163-164 · LJ:203 · LJ:1395',
    tipo: 'termo',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:466 — "Kagemane no Jutsu · C · 4+2/rd · Sustentada. CTR vs Vontade: o alvo fica '
      + 'Preso e copia seus movimentos." · CC:412-413 (Uzumaki) — "Fūin: Kanzen Fūsatsu '
      + '(...) CTR resistido vs Vontade."',
    decisao:
      '"Vontade" é o nome informal da Resiliência Mental. O Kagemane rola d20 + CTR do Nara '
      + 'contra a Resiliência Mental do alvo (10 + ESP). A mesma leitura vale em toda '
      + 'ocorrência de "Vontade" nos dois volumes, incluindo o Fūin: Kanzen Fūsatsu '
      + '(CC:412) e a linha do Kagemane: Kanzen. Onde o texto escrever "vs Vontade" sem '
      + 'dizer o atributo do lado do atacante, usa-se o atributo declarado na própria '
      + 'técnica.',
    porque:
      'P4: o termo recebe a base na unidade que a regra já usa. O livro tem um único número '
      + 'que significa "quanto a mente deste alvo resiste", e ele está definido em LJ:203 — '
      + '"Resiliência Mental = 10 + ESP" — e é contra ele que LJ:1395 manda rolar todo '
      + 'genjutsu. Que "Vontade" é o apelido dele está escrito: LJ:163-164 lista, entre os '
      + 'exemplos canônicos de teste resistido, "genjutsu contra vontade" — descrevendo com '
      + 'a palavra "vontade" exatamente a rolagem que LJ:1395 resolve contra a Resiliência '
      + 'Mental. Não há terceiro candidato: Determinação é perícia (LJ:212-217) e não tem '
      + 'valor passivo, e ESP sozinho não é um CD.',
    principio: 'P4',
    confianca: 'alta',
    aplica: {
      termo: { vontade: 'resiliencia_mental' },
      condicaoCd: [
        { tecnica: 'kagemane', atributo: 'ctr' },
        { tecnica: 'fuin_kanzen_fusatsu', atributo: 'ctr' },
      ],
    },
  },

  {
    id: 'A04',
    cla: 'nara',
    titulo: 'Sombra Estendida dá "+1 zona" sobre um alcance que nunca foi dado',
    onde: 'CC:449-450 · CC:466-467 · CC:487-488 · CC:490 · LJ:2354',
    tipo: 'grandeza',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:449-450 (Estágio II) — "Sombra Estendida. Alcance +1 zona, e você usa a sombra de '
      + 'aliados e objetos." · CC:466-467 — "O alcance depende da sombra — o Mestre deve '
      + 'dizer a hora do dia sempre que houver um Nara."',
    decisao:
      'O alcance base de toda técnica de sombra do clã é Curta (1 zona), medido do Nara até '
      + 'o alvo. Com o Estágio II passa a Média (2 zonas), e a partir daí a sombra de '
      + 'aliados e de objetos serve de origem — o que na prática permite mirar a partir de '
      + 'qualquer aliado ou objeto dentro do alcance. Sem nenhuma fonte de luz na cena, as '
      + 'técnicas de sombra não podem ser usadas até o Estágio V (ver B16). A hora do dia '
      + 'continua sendo cor narrativa: não altera zonas.',
    porque:
      'P4: a base sai do texto vizinho, na mesma unidade — e a unidade do sistema inteiro é '
      + 'a zona (LJ:2354). O vizinho é a única técnica do clã que declara alcance, Kage '
      + 'Yose no Jutsu (CC:487-488), "a até Média"; ela é rank A e de Estágio IV, isto é, '
      + 'está dois degraus acima do Kagemane, então o Kagemane não pode nascer já em Média '
      + '— nasce em Curta e o Estágio II o leva a Média, que é onde o clã declara o seu '
      + 'teto. A dependência de luz não é minha: CC:490 vende a técnica de Estágio V '
      + 'dizendo "A sombra opera sem depender de luz", o que só é um ganho se antes '
      + 'dependesse. O que eu recusei foi transformar "o Mestre deve dizer a hora do dia" '
      + 'em modificador numérico — isso seria escrever regra por cima de uma instrução de '
      + 'narração.',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      tecnicasDeSombra: { alcanceBase: 'Curta', alcanceEstagioII: 'Média' },
      estagio: { cla: 'nara', n: 'II', origemDaSombra: ['propria', 'aliados', 'objetos'] },
      semLuz: { bloqueadoAte: 'V' },
    },
  },

  {
    id: 'C12-nara',
    cla: 'nara',
    titulo: 'O Kagemane deixa o alvo Preso e não declara CD de escape',
    onde: 'CC:466-467 · LJ:687-688',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:466-467 — "o alvo fica Preso e copia seus movimentos" · LJ:687-688 — "Preso: (...) '
      + 'Como sair: Ação Principal + TAI ou COR vs CD do efeito."',
    decisao:
      'CD do Kagemane = 10 + CTR do Nara. Um Nara com CTR +4 prende com CD 14; com CTR +6, '
      + 'com CD 16. Vale para toda a linha de sombra do clã que imponha Preso sem CD '
      + 'impresso: Kagemane, Kagemane Shuriken e Kagekubi Shibari. Onde o CD está impresso, '
      + 'o impresso prevalece — Kagenui no Jutsu CD 16 (CC:481) e Kage Nui: Kunren COR CD 15 '
      + '(CC:484-485). O alvo testa uma vez por rodada, como Ação Principal.',
    porque:
      'P3 e a decisão C12 (decisoes-livro.js), que já fixou a fórmula geral "CD do efeito = '
      + '10 + o atributo que a técnica usa para acertar" e nomeou o Kagemane com o atributo '
      + 'CTR na lista de condicaoCd. Esta entrada só faz a leitura do clã e registra as '
      + 'duas exceções impressas, que P1 protege.',
    principio: 'P3',
    confianca: 'alta',
    aplica: {
      condicaoCd: [
        { tecnica: 'kagemane', atributo: 'ctr' },
        { tecnica: 'kagemane_shuriken', atributo: 'ctr' },
        { tecnica: 'kagekubi_shibari', atributo: 'ctr' },
      ],
      cdImpressoPrevalece: { kagenui: 16, kage_nui_kunren: 15 },
    },
  },

  {
    id: 'C26',
    cla: 'nara',
    titulo: 'Kagemane: Kanzen não tem CD, duração nem manutenção',
    onde: 'CC:490-491 · CC:464 · CC:476 · CC:747 · CC:281',
    tipo: 'numero',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:490-491 — "Kagemane: Kanzen · S · 16 · A sombra opera sem depender de luz. Até '
      + 'cinco alvos Presos; presos não usam Reação nem Substituição, e você pode forçá-los '
      + 'a atacar uns aos outros."',
    decisao:
      'Kagemane: Kanzen · S · 16 + 5 PC por rodada · Sustentada. CD de escape = 10 + CTR do '
      + 'Nara, testado uma vez por rodada por cada alvo, individualmente — quem escapa sai, '
      + 'os outros continuam. Não tem duração máxima: dura enquanto o Nara paga, e cai '
      + 'pelas condições normais da categoria (parar de pagar, ficar Selado, falhar no CTR '
      + 'CD 10 + dano). Forçar um preso a atacar outro consome a Ação Principal do Nara '
      + 'naquela rodada e usa os atributos e as armas do próprio alvo forçado.',
    porque:
      'P4 para a manutenção, P3 e C12 para o CD. A escada de manutenção do clã está '
      + 'impressa e é rasa: Kagemane C 4+2/rd (CC:464) e Kagekubi Shibari B 7+3/rd '
      + '(CC:476) — um passo de +1 por rank. De B para S são dois degraus, o que dá +5. O '
      + 'número também cai dentro da faixa que o Compêndio pratica em Sustentadas de rank S: '
      + 'Mushi Jamu 16+5/rd (CC:747) e Sōshiken 6 PC/rd (CC:281). Peguei o piso da faixa '
      + 'porque a escada do Nara é a mais rasa do livro. INVENÇÃO MINHA: o custo da Ação '
      + 'Principal para forçar um ataque — o texto não diz que custa ação, e sem custo '
      + 'nenhum a técnica daria cinco ataques grátis por rodada, o que a regra 4 do '
      + 'Apêndice e a economia de ações de LJ:2343-2345 não sustentam.',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      tecnica: 'kagemane_kanzen',
      rank: 'S',
      pc: 16,
      pcRodada: 5,
      alvos: 5,
      cd: '10 + CTR',
      testePorAlvoPorRodada: true,
      duracao: 'enquanto pagar a manutenção',
      forcarAtaque: { custo: 'Ação Principal do Nara', usaAtributosDoAlvo: true },
    },
  },

  {
    id: 'B16',
    cla: 'nara',
    titulo: 'O Estágio V destrava "Kage Yose e sombras sem fonte de luz definida"',
    onde: 'CC:460 · CC:487-489 · CC:490',
    tipo: 'termo',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'CC:460 (Estágio V) — "Kage Yose e sombras sem fonte de luz definida." · CC:487-489 — '
      + '"Kage Yose no Jutsu · A · 11 · (...)" com EST. IV · CC:490 — "Kagemane: Kanzen · S '
      + '· 16 · A sombra opera sem depender de luz."',
    decisao:
      'O Estágio IV destrava o Kage Yose no Jutsu, como manda a coluna EST. da tabela; o '
      + 'Estágio V destrava o Kagemane: Kanzen e, além dele, remove a dependência de luz de '
      + 'TODAS as técnicas de sombra do clã — a partir do Estágio V elas funcionam em '
      + 'escuridão total, subterrâneo, ou contra alvo que anule a própria sombra. É esse o '
      + 'conteúdo de "sombras sem fonte de luz definida", e é por isso que a técnica de '
      + 'Estágio V já diz o mesmo sobre si.',
    porque:
      'P1 e D29. CORREÇÃO DA AUDITORIA: o achado trata o Kage Yose como destrava do Estágio '
      + 'V, mas a coluna EST. da tabela de técnicas o marca como IV (CC:489), e D29 já '
      + 'decidiu que a linha da tabela prevalece sobre a prosa da progressão. Restam então '
      + 'duas frases dizendo a mesma coisa — a do Estágio V e a do Kagemane: Kanzen —, e a '
      + 'única leitura em que a do Estágio não é redundante é a que generaliza: o Estágio '
      + 'compra a propriedade para o clã inteiro, e a técnica a repete porque é a única de '
      + 'Estágio V. A "sobreposição não explicada" que a auditoria aponta é justamente a '
      + 'pista.',
    principio: 'P1',
    confianca: 'media',
    aplica: {
      estagio: { cla: 'nara', n: 'V' },
      apelidoDeTecnica: { apelido: 'sombras sem fonte de luz definida', tecnica: 'kagemane_kanzen', estagio: 'V' },
      semLuz: { liberadoNoEstagio: 'V', alcance: 'todas as técnicas de sombra do clã' },
      correcao: { kage_yose_no_jutsu: { estagio: 'IV' } },
    },
  },

  {
    id: 'F17b',
    cla: 'nara',
    titulo: '"Você precisa ficar parado enquanto controla" não é condição do livro',
    onde: 'CC:494-496 · CC:623 · CC:418 · LJ:699 · LJ:712 · LJ:480-481',
    tipo: 'gatilho',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'CC:496 (Fardo) — "Mecanicamente, as técnicas são Sustentadas: sofrer dano exige '
      + 'teste de CTR, e você precisa ficar parado enquanto controla." · CC:623 (Shinshin '
      + 'no Jutsu) e CC:418 (Adamantine Fūsa: Rō) usam a mesma ideia com outra palavra: '
      + '"Você fica imóvel."',
    decisao:
      '"Ficar parado" e "ficar imóvel" são o mesmo estado, e ele é este: enquanto mantém '
      + 'uma técnica Sustentada de sombra, o Nara não tem movimento livre e não pode gastar '
      + 'Ação Principal nem Menor para se mover. Continua com a Reação, pode Esquivar, '
      + 'Bloquear e usar Substituição, e pode gastar ações em qualquer coisa que não seja '
      + 'deslocamento. Se for movido à força — Empurrado, puxado, derrubado de uma altura, '
      + 'carregado —, a técnica termina imediatamente, sem teste. Ficar Caído não encerra: '
      + 'o Nara continua parado, só que no chão.',
    porque:
      'P4: a base sai do texto vizinho, na mesma unidade. O livro já tem a frase exata para '
      + '"não sai do lugar mas continua agindo" e a usa duas vezes na tabela de condições — '
      + 'Lento (LJ:699) e Exaustão 2 (LJ:712) dizem "Sem movimento livre" —, e o Compêndio '
      + 'usa "imóvel" para o mesmo estado em dois clãs (CC:623 e CC:418). Manter a Reação é '
      + 'P1: a regra 2 do Apêndice (LJ:2412-2415) diz que cada personagem tem uma Reação '
      + 'por rodada e nomeia as únicas exceções, e nenhuma delas retira a Reação de quem '
      + 'canaliza — LJ:663 já garante Reação até a quem está Canalizando, que é o estado '
      + 'mais restritivo do sistema. O encerramento por movimento forçado é a leitura '
      + 'mínima que dá sentido à frase: se ser Empurrado não quebrasse nada, "ficar parado" '
      + 'não seria uma exigência.',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      fardo: {
        cla: 'nara',
        controlandoSombra: {
          semMovimentoLivre: true,
          naoPodeGastarAcaoParaMover: true,
          mantemReacao: true,
          encerraSeMovidoAForca: true,
          caidoNaoEncerra: true,
        },
      },
    },
  },

  // ════════════════════════════════════════════════════════════════
  //  AKIMICHI — CC:501-573
  // ════════════════════════════════════════════════════════════════

  {
    id: 'E08',
    cla: 'akimichi',
    titulo: '"Invocação Grande" aplicada ao próprio personagem não diz o que muda',
    onde: 'CC:546-548 · LJ:1708 · CC:1826-1827 · CC:533-534 · CC:686-687',
    tipo: 'termo',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:546-548 — "Chō Baika no Jutsu · B · 7+3/rd · Escala colossal. Invocação Grande '
      + 'por 3 rodadas: 4d6+TAI numa zona inteira, carrega o time. Movimento reduzido a uma '
      + 'zona." · LJ:1708 — "Grande · 11 PC · A · (...) PV 60, ataque 4d6+5, pode carregar '
      + 'o time." · CC:1826-1827 (clã sem nome) — "Kyojin Keitai · A · 11 · Invocação '
      + 'Grande por 4 rodadas: 5d6+TAI, +40 PV temporários."',
    decisao:
      'Quando uma técnica diz que o PERSONAGEM assume a escala Invocação Grande, ela '
      + 'concede exatamente isto: +40 PV temporários pela duração, e o personagem passa a '
      + 'contar como alvo de escala Grande (efeitos escritos contra alvos Grandes ou '
      + 'Colossais o alcançam; ele ocupa a zona inteira em que está e não se esconde atrás '
      + 'de cobertura leve). Tudo o mais vem da linha da própria técnica e não da tabela de '
      + 'invocações: dano, duração, movimento e custo são os impressos, os atributos '
      + 'continuam sendo os do personagem, a Defesa não muda e não se ganha ação extra. Os '
      + 'PV temporários somem ao fim da duração e o dano que tiverem absorvido não volta '
      + 'como dano real. No Chō Baika, a expressão "escala colossal" da mesma linha é '
      + 'descrição, não regra: o termo mecânico é Invocação Grande.',
    porque:
      'P4, com o precedente escrito dentro do próprio Compêndio: CC:1826-1827 é a única '
      + 'passagem dos dois volumes que aplica "Invocação Grande" a um personagem E '
      + 'quantifica o resultado — "+40 PV temporários". Copiei esse número em vez de '
      + 'importar os PV 60 de LJ:1708, que descrevem uma criatura separada com ficha '
      + 'própria, não um PC inflado. Recusar o resto da tabela é P1: as três técnicas que '
      + 'usam o termo (CC:547, CC:686, CC:1826) já declaram dano e duração próprios, e '
      + 'sobrepor os 4d6+5 da invocação apagaria números impressos. A Defesa não muda '
      + 'porque o clã já sabe cobrar por tamanho quando quer: Baika no Jutsu (CC:533-534) '
      + 'escreve "Sua Defesa cai 2 — você é um alvo maior", e o Chō Baika, que é a versão '
      + 'maior, não repete a frase.',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      escalaEmPersonagem: {
        grande: { pvTemporarios: 40, contaComoAlvoGrande: true, ocupaZonaInteira: true, defesa: 0, acaoExtra: false, atributos: 'do personagem' },
        aplicaEm: ['cho_baika_no_jutsu', 'jinju_konbi_henge_sotoro', 'kyojin_keitai'],
        pvTemporariosSomemAoFim: true,
        prevalece: 'a linha da técnica',
      },
    },
  },

  {
    id: 'F09',
    cla: 'akimichi',
    titulo: 'A Pílula Vermelha mata em uma hora e o tratamento não existe',
    onde: 'CC:565-567 · LJ:1274-1275 · LJ:721 · LJ:208 · LJ:2341 · CC:565',
    tipo: 'gatilho',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:565-567 — "Vermelha — destrava o Modo Borboleta e converte a reserva calórica '
      + 'inteira; o personagem morre em uma hora sem tratamento de um médico Especialista. '
      + 'Não há teste, não há sorte. É uma decisão."',
    decisao:
      'Tratamento da Pílula Vermelha: dentro de uma hora da ingestão, um personagem com a '
      + 'perícia Medicina no grau Especialista (+4) ou superior gasta uma cena inteira de '
      + 'atendimento (dez minutos, em contato) e 4 PC, e faz um teste de Medicina (CTR) CD '
      + '20. Sucesso: o Akimichi sobrevive, e termina com 1 PV, Exaustão 3 e um Ferimento '
      + 'Grave rolado em 1d6 (LJ:721-727). Falha: novo teste a cada dez minutos enquanto a '
      + 'hora não acabar, cada um custando outros 4 PC. Sem tratamento concluído dentro da '
      + 'hora, o personagem morre e nenhum PVF, cura ou Teste de Morte reverte — "não há '
      + 'teste, não há sorte" continua valendo para o efeito, não para o tratamento.',
    porque:
      'P4 em cada peça, sem número novo. "Médico Especialista" é grau de perícia declarado '
      + '(LJ:208, "+4, exige rank Chūnin"). O CD é o que o livro cobra para o antídoto mais '
      + 'difícil que ele escreve: LJ:1274-1275, Dokunuki no Jutsu — "Medicina CD 14; venenos '
      + 'rank A+ exigem CD 20" —, e uma pílula que mata sem teste é pelo menos rank A+; 20 '
      + 'também é o degrau "muito difícil" de LJ:2341. Os 4 PC e o contato são a assinatura '
      + 'de toda técnica médica de rank C do Cap. 17 (LJ:1260-1281). E a Exaustão 3 é o '
      + 'próximo degrau da escada que o próprio clã publica na mesma frase: Verde 1 nível, '
      + 'Amarela 2 (CC:565). INVENÇÃO MINHA: o Ferimento Grave rolado, que nenhum texto '
      + 'exige; entrou porque sem sequela a pílula deixaria de ser "uma decisão" e viraria '
      + 'um botão com custo administrativo.',
    principio: 'P4',
    confianca: 'baixa',
    aplica: {
      pilulas: {
        vermelha: {
          janela: '1 hora',
          tratamento: { exige: 'medicina_especialista', tempo: '10 minutos em contato', pc: 4, teste: { pericia: 'medicina', atributo: 'ctr', cd: 20 }, repetivel: 'a cada 10 min dentro da hora' },
          sucesso: { pv: 1, exaustao: 3, ferimentoGrave: '1d6' },
          semTratamento: 'morte, sem Teste de Morte e sem PVF',
        },
      },
    },
  },

  {
    id: 'C21',
    cla: 'akimichi',
    titulo: 'As Pílulas Akimichi não têm preço numa tabela em que tudo tem',
    onde: 'LJ:2095-2106 · LJ:497 · CC:522-524',
    tipo: 'numero',
    impacto: 'cosmetico',
    oQueOLivroDiz:
      'LJ:2100 — "Pílulas Akimichi (Hiden) · Hiden (na coluna de preço) · Verde dobra o dano '
      + 'de taijutsu; Amarela dá +3 TAI/COR; Vermelha destrava o Modo Borboleta e mata em '
      + 'uma hora." · LJ:497 — "Hiden: apenas membros do clã. Segredo de família. Ensinar a '
      + 'um estranho é traição ao clã."',
    decisao:
      'As pílulas não têm preço porque não são vendáveis. A ficha exibe "Hiden — não '
      + 'comprável" no lugar do valor em ryō e bloqueia a compra no inventário. A única '
      + 'fonte é o clã: um Akimichi recebe o estojo das Três Pílulas ao comprar o Estágio '
      + 'IV (CC:522-524), e quem não é do clã não obtém nenhuma delas por dinheiro. Um '
      + 'Akimichi repõe as pílulas gastas entre missões, sem custo, no bairro do clã; um '
      + 'estojo tem uma dose de cada cor por sessão.',
    porque:
      'P1. CORREÇÃO DA AUDITORIA: o achado classifica o preço como ausente, mas ele não '
      + 'está ausente — a célula está preenchida, com a palavra "Hiden", que é uma das seis '
      + 'categorias de acesso do Cap. 9 (LJ:493-502) e significa precisamente "não se '
      + 'obtém por gasto, só por pertencer ao clã". O livro escreveu a resposta na coluna '
      + 'certa, com o vocabulário do próprio sistema. INVENÇÃO MINHA: a reposição gratuita '
      + 'entre missões e o limite de uma dose de cada cor por sessão; nenhum texto os diz, '
      + 'e entraram porque sem eles a ficha não sabe quantas pílulas listar.',
    principio: 'P1',
    confianca: 'media',
    aplica: {
      pilulas: {
        preco: null,
        acesso: 'hiden',
        comprável: false,
        fonte: 'estojo das Três Pílulas, Estágio IV do clã (CC:522-524)',
        reposicao: 'gratuita entre missões, no bairro do clã',
        dosesPorSessao: { verde: 1, amarela: 1, vermelha: 1 },
      },
    },
  },

  {
    id: 'D-lite',
    cla: 'akimichi',
    titulo: 'O Livro do Jogador omite as durações e a Exaustão das pílulas',
    onde: 'LJ:2100 · CC:565-567',
    tipo: 'conflito',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'LJ:2100 — "Verde dobra o dano de taijutsu; Amarela dá +3 TAI/COR; Vermelha destrava '
      + 'o Modo Borboleta e mata em uma hora." · CC:565-566 — "Verde — dobra o dano de '
      + 'taijutsu por 3 rodadas (1 nível de Exaustão). Amarela — +3 em TAI e COR por 5 '
      + 'rodadas (2 níveis)."',
    decisao:
      'Vale a ficha do Compêndio, inteira: Verde — Ação Menor, dobra o dano de taijutsu por '
      + '3 rodadas, 1 nível de Exaustão ao terminar. Amarela — Ação Menor, +3 em TAI e COR '
      + 'por 5 rodadas, 2 níveis de Exaustão ao terminar. Vermelha — ver F09. O +3 da '
      + 'Amarela obedece à regra 1 do Apêndice (LJ:2406-2409): não leva TAI nem COR acima '
      + 'do teto do rank. O "dobra o dano de taijutsu" da Verde incide sobre o total rolado '
      + 'do ataque, pela mesma leitura de A19, e não se aplica a ninjutsu nem a genjutsu.',
    porque:
      'P2, sem exceção a acionar: o Compêndio é o texto mais recente e mais específico, e '
      + 'aqui ele não contraria número nenhum do Livro do Jogador — só acrescenta os dois '
      + 'que faltavam (duração e Exaustão). Os efeitos são idênticos nas duas passagens, '
      + 'então não há conflito real, e sim uma ficha completa e outra abreviada. O teto do '
      + 'Apêndice não é acréscimo meu: LJ:2408 nomeia expressamente "de passiva de clã, de '
      + 'técnica sustentada, de equipamento" como fontes que não furam o teto, e uma pílula '
      + 'é equipamento consumível.',
    principio: 'P2',
    confianca: 'alta',
    aplica: {
      pilulas: {
        verde: { execucao: 'Ação Menor', efeito: 'dobra o dano de taijutsu', duracaoRodadas: 3, exaustao: 1 },
        amarela: { execucao: 'Ação Menor', efeito: '+3 TAI e COR', duracaoRodadas: 5, exaustao: 2, respeitaTetoDeAtributo: true },
      },
    },
  },

  // ════════════════════════════════════════════════════════════════
  //  YAMANAKA — CC:575-636
  // ════════════════════════════════════════════════════════════════

  {
    id: 'B01',
    cla: 'yamanaka',
    titulo: '"Interrogatório Profundo" não existe em tabela nenhuma',
    onde: 'CC:594-595 · CC:617-619 · CC:592-593 · LJ:513-516',
    tipo: 'termo',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:594-595 (Estágio III) — "Interrogatório Profundo e a Formação Ino-Shika-Chō sem '
      + 'custo." · CC:617-619 (tabela, Estágio III) — "Shinkenkai · B · 7 · Leia memórias '
      + 'específicas de um alvo capturado, inconsciente ou morto há menos de 24h. Resolve '
      + 'investigações e cria dilemas éticos na mesma cena."',
    decisao:
      '"Interrogatório Profundo" é o nome de campo do Shinkenkai. O Estágio III não cria '
      + 'técnica nova: destrava a técnica de Estágio III da tabela, que passa a ser '
      + 'comprável por 6 PT (rank B = 8 PT, menos 2 do desconto de Hiden do próprio clã, '
      + 'LJ:515) e custa 7 PC por uso. A ficha lista uma única entrada, "Shinkenkai '
      + '(Interrogatório Profundo)", e nunca duas.',
    porque:
      'P6 na sua forma mais barata: a menor coisa que faz o Estágio valer o PT é ele ser o '
      + 'nome da técnica que aquele mesmo Estágio lista — foi assim que D31 resolveu o '
      + '"Duplo Tempo" dos Hatake, e a decisão daqui é a mesma leitura. E o padrão é do '
      + 'livro, não meu: o Compêndio escreve as destravas em português descritivo na tabela '
      + 'de progressão e as técnicas em japonês na tabela de técnicas, e faz isso em seis '
      + 'clãs — "Grande Hidrificação"/Daisuika (CC:1199), "Fusão Aquática"/Suichū Yūgō '
      + '(CC:1203), "Transformação Parcial"/Bubun Henge (CC:1796), "Armadura de '
      + 'Areia"/Suna no Yoroi (CC:1623), "Genjutsu de Sangue"/Magen: Chishio (CC:1749), '
      + '"Fio de Chakra Tecido"/Kumo Nawa (CC:1900). O marco do Estágio III é "um turno na '
      + 'Força de Tortura e Interrogação" (CC:592-593), que é exatamente o que o Shinkenkai '
      + 'faz.',
    principio: 'P6',
    confianca: 'media',
    aplica: {
      apelidoDeTecnica: { apelido: 'Interrogatório Profundo', tecnica: 'shinkenkai', estagio: 'III' },
      tecnica: 'shinkenkai',
      rank: 'B',
      pc: 7,
      pt: 6,
    },
  },

  {
    id: 'B02',
    cla: 'yamanaka',
    titulo: '"Rede de Guerra" não existe em tabela nenhuma',
    onde: 'CC:598 · CC:620-623 · CC:596-597 · LJ:513-516',
    tipo: 'termo',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:598 (Estágio IV) — "Rede de Guerra." · CC:620-623 (tabela, Estágio IV) — "Shinshin '
      + 'no Jutsu · A · 11+3/rd · Conecte telepaticamente até 50 pessoas: todos agem na '
      + 'mesma iniciativa e compartilham percepção. Você fica imóvel." · CC:596-597 (marco) '
      + '— "Ser designado para a rede de comando de uma operação de grande escala."',
    decisao:
      '"Rede de Guerra" é o nome de campo do Shinshin no Jutsu. O Estágio IV destrava as '
      + 'duas técnicas de Estágio IV da tabela: Shinshin no Jutsu (A · 11 + 3/rd, 12 PT com '
      + 'o desconto de Hiden) e Kokoro Rō (B · 7, 6 PT). O "ficar imóvel" do Shinshin no '
      + 'Jutsu lê-se como em F17b: sem movimento livre, sem gastar ação para mover, com '
      + 'Reação mantida, e a técnica cai se o Yamanaka for movido à força.',
    porque:
      'Mesma leitura de B01, mesmo precedente de D31, e aqui o marco fecha o argumento '
      + 'sozinho: CC:596-597 exige "a rede de comando de uma operação de grande escala", e '
      + 'a técnica da linha é literalmente uma rede de até cinquenta pessoas agindo na '
      + 'mesma iniciativa. Que o Estágio destrave as duas técnicas do seu nível, e não só a '
      + 'nomeada, é o padrão do próprio Compêndio (CC:236 "e as técnicas de Estágio III", '
      + 'CC:382, CC:524, CC:971) — a linha do Yamanaka apenas abreviou.',
    principio: 'P6',
    confianca: 'media',
    aplica: {
      apelidoDeTecnica: { apelido: 'Rede de Guerra', tecnica: 'shinshin_no_jutsu', estagio: 'IV' },
      estagio: { cla: 'yamanaka', n: 'IV', destrava: ['shinshin_no_jutsu', 'kokoro_ro'] },
      tecnicas: [
        { tecnica: 'shinshin_no_jutsu', rank: 'A', pc: 11, pcRodada: 3, pt: 12, imovel: true },
        { tecnica: 'kokoro_ro', rank: 'B', pc: 7, pt: 6 },
      ],
    },
  },

  {
    id: 'A03',
    cla: 'yamanaka',
    titulo: 'Dobrar um alcance telepático que já é "a qualquer distância"',
    onde: 'CC:591 · CC:582-583',
    tipo: 'grandeza',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'CC:591 (Estágio II) — "Shinranshin e alcance telepático dobrado." · CC:582-583 '
      + '(Passiva) — "Você se comunica telepaticamente com qualquer aliado que já tenha '
      + 'tocado, a qualquer distância, por 1 PC por mensagem."',
    decisao:
      'Não há dobro: o alcance da telepatia Yamanaka já é ilimitado e continua ilimitado. O '
      + 'Estágio II converte esse ganho vazio num ganho declarado — a partir dele cai o '
      + 'requisito de toque prévio: o Yamanaka se comunica com qualquer criatura que ele já '
      + 'tenha visto pessoalmente, a qualquer distância, pelo mesmo 1 PC por mensagem. A '
      + 'ficha deixa de perguntar "você já tocou nesta pessoa?" e passa a perguntar "você já '
      + 'a viu?". O Estágio II continua destravando o Shinranshin normalmente.',
    porque:
      'P4, na sua segunda metade, que trata exatamente deste caso: "onde a base é '
      + 'literalmente infinita (\'a qualquer distância\'), dobrar não significa nada: a '
      + 'decisão é dizer isso e converter o Estágio em outro ganho declarado". O ganho '
      + 'escolhido não é aleatório — é a outra restrição escrita na mesma frase da Passiva '
      + '(CC:582, "qualquer aliado que já tenha tocado"), a única que o Estágio poderia '
      + 'estar comprando. Trocar toque por vista mantém uma trava real (o Yamanaka ainda '
      + 'precisa ter encontrado a pessoa) e resolve na mesa o que a frase original prometia '
      + 'sem entregar.',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      estagio: { cla: 'yamanaka', n: 'II' },
      passiva: {
        cla: 'yamanaka',
        telepatia: { alcance: 'ilimitado', requisitoBase: 'ter tocado', requisitoEstagioII: 'ter visto pessoalmente', pcPorMensagem: 1 },
      },
      revogaEfeito: 'alcance telepático dobrado (CC:591)',
    },
  },

  {
    id: 'F05',
    cla: 'yamanaka',
    titulo: '"Se o alvo sair do alcance, você fica preso nele"',
    onde: 'CC:605-606 · CC:633-634 · LJ:1395',
    tipo: 'gatilho',
    impacto: 'bloqueia',
    oQueOLivroDiz:
      'CC:605-606 — "Shintenshin no Jutsu · C · 4 · GEN vs Resiliência Mental a Média. '
      + 'Sucesso: controla o corpo do alvo por uma rodada. Seu corpo fica indefeso; se o '
      + 'alvo sair do alcance, você fica preso nele."',
    decisao:
      'Ficar preso no alvo é um estado com estas regras: o Yamanaka continua controlando o '
      + 'corpo do alvo indefinidamente e não paga mais PC por isso; o corpo original fica '
      + 'inconsciente e indefeso na zona onde ficou (CC:634), fazendo Testes de Morte '
      + 'normalmente se sofrer dano; o alvo permanece consciente e ciente de tudo, sem '
      + 'controle do próprio corpo. Para voltar, o Yamanaka gasta uma Ação Principal e rola '
      + 'd20 + GEN contra a Resiliência Mental do alvo — a mesma rolagem da técnica —, uma '
      + 'tentativa por rodada; o sucesso o devolve ao corpo. Alternativa automática: se os '
      + 'dois corpos voltarem a ficar a até Média um do outro, o retorno acontece no início '
      + 'do próximo turno do Yamanaka, sem teste. Se o corpo original morrer enquanto ele '
      + 'está preso, o efeito vira permanente e é tratado como Shinden (CC:628-629).',
    porque:
      'P3 e P1. Não inventei rolagem: usei a que a técnica declara — "GEN vs Resiliência '
      + 'Mental" (CC:605) —, que é a mesma forma de P3 (10 + o atributo do alvo). A saída '
      + 'automática pela distância é a leitura simétrica do gatilho: se sair do alcance '
      + 'prende, voltar ao alcance solta, e o alcance está impresso (Média). O destino do '
      + 'corpo original é literal em CC:634, no Fardo do próprio clã. E a permanência em '
      + 'caso de morte do corpo não é acréscimo: o Compêndio já tem essa técnica com nome, '
      + 'Shinden (CC:628-629), "Transferência mental permanente e sem retorno para outro '
      + 'corpo. Seu corpo original morre" — o estado preso é a versão acidental dela.',
    principio: 'P3',
    confianca: 'media',
    aplica: {
      tecnica: 'shintenshin_no_jutsu',
      presoNoAlvo: {
        gatilho: 'alvo sai do alcance Média',
        controleContinua: true,
        pcAdicional: 0,
        corpoOriginal: 'inconsciente e indefeso, faz Testes de Morte',
        alvoConsciente: true,
        saida: { acao: 'Ação Principal', rolagem: 'd20 + GEN vs Resiliência Mental', porRodada: 1 },
        saidaAutomatica: 'os dois corpos a até Média, no início do turno seguinte',
        morteDoCorpoOriginal: 'vira Shinden (permanente)',
      },
    },
  },

  {
    id: 'C-y1',
    cla: 'yamanaka',
    titulo: 'A técnica de assinatura do clã dura uma rodada e não diz se pode ser mantida',
    onde: 'CC:605 · CC:464 · CC:531 · CC:663 · LJ:894 · LJ:686',
    tipo: 'numero',
    impacto: 'atrapalha',
    oQueOLivroDiz:
      'CC:605 — "Shintenshin no Jutsu · C · 4 · GEN vs Resiliência Mental a Média. Sucesso: '
      + 'controla o corpo do alvo por uma rodada."',
    decisao:
      'Shintenshin passa a ser Sustentada: C · 4 + 2 PC por rodada. A primeira rodada de '
      + 'controle é a impressa; para manter, o Yamanaka paga 2 PC no início de cada turno '
      + 'seu, sem limite de rodadas, enquanto o alvo permanecer a até Média. O alvo não '
      + 'repete o teste — a técnica acertou uma vez —, mas cai se o Yamanaka deixar de '
      + 'pagar, ficar Selado, ou falhar num teste de CTR CD 10 + dano sofrido pelo corpo '
      + 'que ele está pilotando (LJ:480-481).',
    porque:
      'P4: a base sai do texto vizinho, na mesma unidade. Toda técnica de controle contínuo '
      + 'de rank C dos dois livros tem manutenção de +2 PC por rodada — Kagemane C 4+2/rd '
      + '(CC:464) e Suirō no Jutsu C 4+2/rd (LJ:894) —, enquanto as de rank C que só '
      + 'melhoram o usuário ficam em +1 (Baika no Jutsu, CC:531; Shikyaku D 2+1/rd, '
      + 'CC:663). O Shintenshin é do primeiro grupo. Sem isso, a assinatura do clã dura '
      + 'menos que um Atordoado (LJ:686, que dura até o fim do próximo turno) e o Estágio I '
      + 'entrega uma técnica que nunca compensa a ação — o que P6 chama de não fazer o '
      + 'Estágio valer.',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      tecnica: 'shintenshin_no_jutsu',
      rank: 'C',
      pc: 4,
      pcRodada: 2,
      duracao: 'enquanto pagar a manutenção',
      alvoNaoRepeteTeste: true,
      encerraPor: ['nao_pagar', 'selado', 'falha_ctr_cd_10_mais_dano', 'alvo_fora_de_media'],
    },
  },

  {
    id: 'C-y2',
    cla: 'yamanaka',
    titulo: 'Duas técnicas rank B no Estágio IV, onde o framework pede rank A',
    onde: 'CC:617-619 · CC:625-627 · CC:60-71',
    tipo: 'conflito',
    impacto: 'cosmetico',
    oQueOLivroDiz:
      'CC:625-627 — "Kokoro Rō · B · 7 · Tranca o alvo dentro da própria cabeça: Sob Ilusão '
      + 'profundidade 3, revivendo a pior memória. 2d6 mental/rd." com EST. IV · CC:617-619 '
      + '— "Shinkenkai · B · 7" com EST. III · CC:60-71 (framework) — "IV — Segredo: (...) '
      + 'Estágio IV (rank A)".',
    decisao:
      'Vale a linha impressa: Kokoro Rō é rank B e custa 7 PC, no Estágio IV; Shinkenkai é '
      + 'rank B e custa 7 PC, no Estágio III. Nada muda. A disponibilidade segue a '
      + 'validação de D29 — Estágio destravado pela coluna EST. mais rank de ninja '
      + 'suficiente para o rank da técnica —, e a coluna de rank do framework é descritiva. '
      + 'Na prática o Yamanaka é um clã barato: chega ao Estágio IV com duas técnicas de '
      + 'rank B e uma de rank A, e é assim que ele foi impresso.',
    porque:
      'P1 e D29, que já decidiu esta classe inteira: "o rank impresso na linha da técnica '
      + 'prevalece sempre; a coluna de rank do framework é descritiva". Esta entrada existe '
      + 'só para registrar o caso do clã e evitar que a ficha marque as duas linhas como '
      + 'erro. CORREÇÃO DA AUDITORIA: o achado é classificado como tipo D (conflito) com '
      + 'impacto cosmético e cita apenas CC:625-626; o Shinkenkai está em CC:617-619, e o '
      + 'caso é o mesmo de D29, não um conflito novo.',
    principio: 'P1',
    confianca: 'alta',
    aplica: {
      tecnicas: [
        { tecnica: 'kokoro_ro', rank: 'B', pc: 7, estagio: 'IV' },
        { tecnica: 'shinkenkai', rank: 'B', pc: 7, estagio: 'III' },
      ],
      frameworkEhDescritivo: true,
    },
  },

  {
    id: 'F-y3',
    cla: 'yamanaka',
    titulo: 'O Fardo das memórias alheias não impõe nada mecânico',
    onde: 'CC:632-634 · CC:353-354',
    tipo: 'gatilho',
    impacto: 'cosmetico',
    oQueOLivroDiz:
      'CC:632-634 — "Cada uso de Shinkenkai ou Kokoro Rō deixa uma memória alheia com você. '
      + 'A cada três acumuladas, teste ESP CD 15 no início de cada sessão: a falha permite '
      + 'ao Mestre, uma vez, narrar você reagindo com o sentimento de outra pessoa."',
    decisao:
      'A falha no ESP CD 15 dá ao Mestre uma ficha marcada, gasta uma única vez naquela '
      + 'sessão: no momento em que ele narrar o Yamanaka reagindo com o sentimento de outra '
      + 'pessoa, aquele teste sofre Desvantagem. O Mestre declara a marca antes da rolagem, '
      + 'e ela vale para qualquer teste — social, de percepção, de ataque — desde que a '
      + 'narração venha junto. Marcas não se acumulam entre sessões: a de uma sessão não '
      + 'gasta se perde. A contagem de memórias continua subindo (uma por uso de Shinkenkai '
      + 'ou Kokoro Rō, teste a cada três).',
    porque:
      'P4, com o precedente a duzentas e oitenta linhas de distância, no mesmo capítulo e '
      + 'no mesmo formato: o Fardo Senju (CC:353-354) — "Ao falhar gravemente numa missão '
      + 'pública, o Mestre pode impor Desvantagem no próximo teste social em Konoha". É a '
      + 'mesma construção — falha, uma vez, à escolha do Mestre — e o Compêndio já a '
      + 'traduziu em Desvantagem uma vez. Só larguei a limitação a testes sociais, porque '
      + 'o gatilho aqui é emocional e não público. Sem isso, um Fardo listado entre as '
      + 'mecânicas do clã não cobra nada, e todo Fardo do livro cobra.',
    principio: 'P4',
    confianca: 'media',
    aplica: {
      fardo: {
        cla: 'yamanaka',
        memorias: { ganhaPorUso: ['shinkenkai', 'kokoro_ro'], testeACadaN: 3, teste: { atributo: 'esp', cd: 15 }, quando: 'início da sessão' },
        naFalha: { efeito: 'Desvantagem em um teste, à escolha do Mestre, declarado antes da rolagem', usos: 1, porSessao: true, acumulaEntreSessoes: false },
      },
    },
  },

];
