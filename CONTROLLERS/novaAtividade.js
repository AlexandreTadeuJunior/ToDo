var amigosAtividade = [];

ini_novaAtividade();

function ini_novaAtividade(){
  console.log("montamos o js");

  montaBotoes();

}

function montaBotoes(){

  //clique do botao salvar
  $('#btn_SalvarAtividade').click(function(event) {
    salvaAtividade();
  });

  //Monta efeito para aparecer a msg a cima do botao
	$('.tooltipped').tooltip();

  $('.datepicker').pickadate({
	       selectMonths: true, // Creates a dropdown to control month
	       selectYears: 15, // Creates a dropdown of 15 years to control year
				 labelMonthNext: 'Proximo mes',
         labelMonthPrev: 'mes anterior',
				 labelMonthSelect: 'Selecione o mes',
         labelYearSelect: 'Selecione o ano',
				 monthsFull: [ 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro' ],
				 monthsShort: [ 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez' ],
				 weekdaysFull: [ 'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sabado' ],
				 weekdaysShort: [ 'Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab' ],
				 format: 'yyyy-mm-dd',
				 today: 'Hoje',
				 clear: 'Limpar',
				 close: 'Fechar',

	   });
}

//salva a atividade
function salvaAtividade(){
  
  $.ajax({
		url: '../API/api.php',
		type: 'POST',
		dataType: 'json',
		cache: false,
        async: true, //false= ajax return do dnx, true = ajax layer do dnx
		data: {cmd: "salvarAtividade",dados: JSON.stringify( $('#form-novaAtividade').serializeObject()), usuario: localStorage.nomeUsuario, email: localStorage.emailUsuario},
		crossDomain: true,
          xhrFields: {
            withCredentials: false
          }
	})
	.done(function(json) {
		console.log("success");
		Materialize.toast(json.status, 5000);
	})
	.fail(function() {
		console.log("fail");
	})
	.error(function(erro, a, e) {
		console.log("Encontramos um erro: " + erro.responseText + " - Status: " + erro.status + " - Elemento: " + e);
	})
	.always(function() {
		console.log("complete");
	});
}
