# Ricochetes PvP 1.4

Previsão de trajetória, identificação de skills e busca de jogadas por dano estimado na arena PvP.

- [Baixar instalador Windows 1.4](RicochetesPvP-1.4.exe?raw=true)
- [Baixar extensão ZIP](RicochetesPvP-extensao.zip?raw=true)
- [Código-fonte ZIP](RicochetesPvP-fonte.zip?raw=true)
- [Hashes SHA-256](RicochetesPvP.sha256)

## O que mudou

O painel mostra o dano previsto da mira atual, abates e ativações de Emboscada. **Buscar maior dano** compara direções e forças do herói ativo por até três segundos. Inclui a mira atual, direções para os heróis, uma varredura angular e refinamento das melhores candidatas quando sobra tempo. Exibe até três sugestões diferentes, com ângulo, força, dano, abates, cura e uma sequência de eventos.

A linha dourada representa a sugestão selecionada. A linha verde continua representando a mira atual. Quando a sugestão prevê Emboscada, o trajeto do Ladino aparece em roxo. **Ajustar mira do jogo** posiciona a direção e a força escolhidas; o lançamento continua manual. A busca nunca chama a função de lançar.

Sugestões expiram quando muda o turno, o herói ativo, os atributos, as posições, o HP ou a sala. **Cancelar** interrompe a busca. Não há execução automática de novas buscas a cada turno.

## Instalar ou atualizar

1. Abra `RicochetesPvP-1.4.exe` e clique em **Preparar extensão**.
2. No navegador onde você já está conectado, abra `chrome://extensions` ou `edge://extensions`.
3. Ative **Modo do desenvolvedor** e use **Carregar sem compactação**. Selecione a pasta cujo caminho foi copiado.
4. Se ainda estiver instalada, desative a extensão 1.3 para manter apenas a versão 1.4 em uso.
5. Volte à aba do jogo. No menu da extensão **Ricochetes PvP**, clique em **Ativar nesta aba**. Abra a Arena PvP.
6. Durante sua vez, clique em **Buscar maior dano**. Selecione uma sugestão e confira a sequência antes de ajustar a mira.

Outra opção é extrair `RicochetesPvP-extensao.zip` e carregar a pasta que contém `manifest.json`. Quem clona o repositório pode carregar diretamente a pasta `extension`.

O programa prepara arquivos em `%LOCALAPPDATA%\FarmRicochetTrajetoria\extension-1.4.0`. Mantenha essa pasta no mesmo local após carregá-la. Depois de preparada, a extensão funciona sem o programa aberto. Requer Chrome/Edge compatível com Manifest V3 e Chrome 111 ou posterior. O executável é Windows x64 e não requer Python instalado.

## Skills reconhecidas no modelo v13

Os valores são lidos dos atributos da partida, sem números fixos de dano por classe.

| Herói | Regra usada |
| --- | --- |
| Ladino | Soma `skill` ao dano na jogada de outro aliado. Vale para o inimigo lançado contra o Ladino e para o Ladino empurrado contra um inimigo. A sequência aliado → inimigo → Ladino é identificada no registro. |
| Cavaleiro | Reduz o primeiro ataque recebido do turno em até `skill`. |
| Sacerdote | Cura outro aliado tocado durante a jogada da equipe, até o HP máximo. Não ressuscita. |
| Machadeiro | Soma `skill` ao dano quando está abaixo de 50% do HP máximo. |
| Lanceiro | Bônus proporcional à distância percorrida: `skill` por 360 unidades, limitado a duas larguras. |
| Arqueira | Ao terminar uma simulação completa, causa `skill` no inimigo vivo com menos HP absoluto. Precisa estar viva e ser da equipe do turno. |
| Espadachim | Na própria jogada, acumula bônus por acerto. A ordem do primeiro bônus é uma hipótese conservadora: o primeiro golpe prepara o bônus do próximo. |
| Templário | Na própria jogada, marca o alvo; o próximo contato com outro aliado aumenta o dano dessa colisão em `skill × 100%` e consome a marca. A trajetória do empurrão é estimada. |
| Mago | Reconhece a Explosão e sua porcentagem sobre o HP restante do alvo após o impacto. O alcance real não está confirmado: com raio 0, a área é omitida do dano. Um raio experimental informado habilita essa hipótese no cálculo. |

O modelo aplica dano apenas pela equipe que está jogando, limita o dano ao HP restante e remove os heróis mortos previstos das colisões seguintes. Cura é informada separadamente e não é somada ao dano para decidir o primeiro lugar. Em empate de dano, usa abates, cura e menor força como desempate.

## Precisão e limites

**O resultado é a melhor estimativa entre as candidatas testadas, não o máximo garantido do servidor.** A busca não percorre todos os ângulos e forças contínuos. O tempo e a quantidade de simulações variam com o computador. Habilidades omitidas podem alterar a ordem das sugestões, especialmente a área do Mago.

A física continua ajustada parcialmente a replays `pvp-v13`: peso, força, desaceleração e restituição das colisões. Foi adotada uma janela estimada de 150 ms por par de heróis para evitar contabilizar contatos repetidos. A ordem de certos efeitos, o empurrão do Templário, a área do Mago e sequências longas não foram confirmados contra o código do servidor. Regras desconhecidas são sinalizadas; suas skills ficam fora do modelo.

O teste de regressão usa um replay real sanitizado, sem nomes de jogadores ou IDs: reproduz os danos de 1490 e 529,5379 HP, com Escudo e Emboscada, totalizando 2019,5379 HP e uma eliminação. Os contatos previstos ficam a menos de 40 ms dos dois contatos registrados. Isso confirma esse caso; não valida universalmente todas as skills ou outras partidas.

Os demais testes cobrem as regras declaradas, limites de HP/cura, mortes previstas, cancelamento, orçamento da busca, alterações de turno e extensão. A interface é verificada em uma arena local baseada nesse replay. Uma nova partida real com a versão 1.4 não foi executada durante essa atualização.

## Funcionamento

O instalador não abre outro perfil nem requer novo login Google. A extensão usa a página já conectada, com permissões `activeTab` e `scripting` e conteúdo limitado à página do jogo. O cálculo é local. O botão de ajustar mira muda apenas a mira; o jogo pode transmitir essa mira pelo próprio funcionamento normal. Nenhuma ação de baú, inventário ou economia faz parte da extensão.

O botão × remove a sobreposição enquanto a mesma arena estiver aberta. **Remover desta aba**, no menu da extensão, desliga também a reinstalação naquele documento. Após recarregar a página, ela volta a iniciar; desative a extensão para impedir isso permanentemente.

## Recompilar e testar

Requer Python x64 3.10+ e Node.js. Execute `.\build.ps1` na raiz. O script gera a extensão, executa os testes e compila `dist/RicochetesPvP.exe`.

Para testar sem compilar:

```powershell
python package_extension.py
python -m unittest discover -p 'test_*.py'
node test_extension.cjs
node test_tactics.cjs
```
