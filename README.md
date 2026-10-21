# Ricochetes PvP

Previsão estimada de ricochetes na arena PvP, com extensão Chrome/Edge e preparador para Windows x64.

- [Baixar executável 1.3](RicochetesPvP-1.3.exe?raw=true)
- [Baixar extensão ZIP](RicochetesPvP-extensao.zip?raw=true)
- [Código-fonte ZIP](RicochetesPvP-fonte.zip?raw=true)
- [Hashes SHA-256](RicochetesPvP.sha256)

## Recompilar e testar

Requer Python x64 3.10+ e Node.js. Execute `.\build.ps1` na raiz do projeto. O script gera a extensão, executa os testes e compila `dist/RicochetesPvP.exe`.

Para testar sem compilar: `python -m unittest discover -p 'test_*.py'` e `node test_extension.cjs`.

# Ricochetes PvP 1.3 — usar o navegador já aberto

A versão 1.3 substitui o lançador anterior por um preparador de extensão. Use `RicochetesPvP-1.3.exe`. O perfil separado da versão 1.2 exigia outro login. Esta versão usa a aba normal onde você já está conectado.

## Instalação uma vez

1. Abra `RicochetesPvP-1.3.exe` e clique em **Preparar extensão**. O caminho da pasta é copiado.
2. No mesmo Chrome onde o jogo está aberto, digite `chrome://extensions` na barra de endereço.
3. Ative **Modo do desenvolvedor** e clique em **Carregar sem compactação**.
4. Na seleção de pasta, cole o caminho copiado e confirme essa pasta.
5. Volte à aba `https://farmricochet.com/play`. No menu de extensões do Chrome, abra **Ricochetes PvP** e clique em **Ativar nesta aba**. Isso funciona na aba atual, sem recarregar uma partida.

No Edge, o endereço equivalente é `edge://extensions`; os demais passos são os mesmos. O pacote requer navegador Chromium compatível com Manifest V3 e execução MAIN declarativa (Chrome 111 ou posterior).

A pasta preparada fica em `%LOCALAPPDATA%\FarmRicochetTrajetoria\extension-1.3.0`. Mantenha essa pasta: o navegador usa seus arquivos diretamente. Se mover ou apagar a pasta, será preciso carregar a extensão novamente. Também é possível selecionar diretamente a pasta `RicochetesPvP-extensao` desta entrega; mantenha-a no mesmo local depois disso.

O ZIP da extensão deve ser extraído antes de usar **Carregar sem compactação**. Selecione a pasta que contém `manifest.json`.

## Uso

Depois de instalada, a extensão inicia automaticamente quando a página do jogo é carregada e aguarda a Arena PvP. Para uma aba que já estava aberta antes da instalação, use **Ativar nesta aba**. O programa Windows pode ser fechado após preparar os arquivos.

Os controles da previsão ficam ao lado da arena. O botão × é respeitado enquanto o mesmo elemento de arena estiver aberto. Para voltar, use **Ativar nesta aba** no menu da extensão.

**Remover desta aba** interrompe a instalação automática naquele documento e remove a previsão. Ao recarregar a página, ela volta a iniciar. Para desligar permanentemente, desative ou remova a extensão em `chrome://extensions`. Remover a extensão pode deixar uma sobreposição já instalada até a página ser recarregada; use primeiro **Remover desta aba** se quiser eliminá-la sem recarregar.

## Login e acesso

O preparador não inicia navegadores, não abre uma porta de depuração e não manipula perfis. A extensão atua na página do Farm Ricochet. O menu usa as permissões `activeTab` e `scripting` para ativar ou remover a previsão na aba selecionada. Não há leitura de cookies, integração com contas Google nem envio de credenciais pelo programa.

O aviso de login Google da janela anterior não foi reproduzido ou diagnosticado nesta atualização. Usar a sessão já aberta elimina a necessidade daquele segundo login; não confirma nem altera a causa do aviso.

A instalação manual segue o [fluxo documentado pelo Chrome](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked). A execução na aba usa [content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts) e a [API scripting](https://developer.chrome.com/docs/extensions/reference/api/scripting).

## Precisão e verificação

O modelo de trajetória continua na versão 1.2: estimativas de peso, força, desaceleração e colisões ajustadas a replays `pvp-v13`. A extensão não melhora a calibração da física. Habilidades e mortes futuras não são simuladas; sequências longas podem divergir.

Verificados: extração íntegra dos arquivos, inicialização da interface do executável compilado, sintaxe do script empacotado e testes simulados de espera pela arena, troca de arena, remoção manual, reativação, recuperação de erro, remoção durante importação e seleção da aba correta.

A instalação real da extensão no seu perfil Chrome/Edge e uma partida usando essa instalação ainda não foram verificadas. Os testes simulados não substituem essa etapa.

`RicochetesPvP-fonte.zip` contém o código, o script da previsão, a extensão, testes e `build.ps1`. Recompilar requer Python x64 e Node para os testes JavaScript; executar o programa pronto não requer Python.


