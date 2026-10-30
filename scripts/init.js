const { execFileSync } = require('node:child_process');
const readline = require('node:readline/promises');

function git(...args) {
  execFileSync('git', args, { stdio: 'inherit' });
}

function gitSemErro(...args) {
  try {
    execFileSync('git', args, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function pegarUrl() {
  const doComando = process.argv[2];
  if (doComando) return doComando.trim();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const digitada = (await rl.question('URL do repositório no GitHub: ')).trim();
  rl.close();
  return digitada;
}

async function main() {
  const url = await pegarUrl();
  if (!url.startsWith('https://github.com/') && !url.startsWith('git@github.com:')) {
    console.error('URL inválida. Exemplo: https://github.com/usuario/repositorio.git');
    process.exit(1);
  }

  git('init');
  git('add', '.');

  if (!gitSemErro('commit', '-m', 'first commit')) {
    console.log('Nada novo para commitar, seguindo em frente.');
  }

  git('branch', '-M', 'main');

  // se o "origin" já existir, só atualiza o endereço
  if (!gitSemErro('remote', 'add', 'origin', url)) {
    git('remote', 'set-url', 'origin', url);
  }

  git('push', '-u', 'origin', 'main');
  console.log('\nPronto! Projeto enviado para', url);
}

main();