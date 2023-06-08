function getDate() {
    let dataAtual = new Date();
    dataAtual.setUTCHours(dataAtual.getUTCHours() - 3);

    let hora = padZero(dataAtual.getUTCHours());
    let minuto = padZero(dataAtual.getUTCMinutes());
    let dia = padZero(dataAtual.getUTCDate());
    let mes = padZero(dataAtual.getUTCMonth() + 1); // Adicione +1, pois o mês começa em zero (janeiro é 0)
    let ano = dataAtual.getUTCFullYear();

    let dataFormatada = hora + ':' + minuto + ' - ' + dia + '/' + mes + '/' + ano;

    function padZero(numero: number) {
        return numero < 10 ? '0' + numero : numero;
    }
    return `${dataFormatada} (UTC-3)`
}

export { getDate }