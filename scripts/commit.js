const { execFileSync } = require('node:child_process');
const readline = require('node:readline/promises');

function git(...args) {
  execFileSync('git', args, { stdio: 'inherit' });
}

async function pegarMensagem() {
  const doComando = process.argv.slice(2).join(' ').trim();
  if (doComando) return doComando;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const digitada = (await rl.question('Mensagem do commit: ')).trim();
  rl.close();
  return digitada;
}

async function main() {
  git('add', '.');
  git('status', '--short');

  const mensagem = await pegarMensagem();
  if (!mensagem) {
    console.error('Commit cancelado: a mensagem não pode ficar vazia.');
    process.exit(1);
  }

  try {
    git('commit', '-m', mensagem);
  } catch {
    console.error('Nada foi commitado (talvez não haja alterações).');
    process.exit(1);
  }

  git('push');
}

main();