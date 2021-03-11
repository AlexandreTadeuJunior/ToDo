<?php
  //variaveis para se conectar ao banco de dados
  $user = 'root';//usuario do banco
  $password = 'root';//senha do banco
  $database = 'bd_todo';//nome do banco de dados
  $host = 'localhost';//servidor
  $port = 3306;//porta do servidor de banco de dados
  //fim das variaveis

  /**
   * [db_on funcao para conectar ao banco de dados]
   * @return [type]           [conecta ao banco]
   */
  function db_on(){
    //recebe as variaveis globais
    global $user, $password, $host, $port, $database;

    if($host == "localhost"){//se tiver executando o aplicativo no localhost
      ini_set('display_errors', 1);//abilita erros amigaveis
      ini_set('log_erros', 1);
      ini_set('erro_log', dirname(__FILE__). '/error_log.txt');
      error_reporting(E_ALL);
    } else {
      ini_set('display_errors', 0); //caso contratio desabilita o erros amigaveis
      ini_set('log_errors', 0);
      error_reporting(E_ALL);
    }

    $conector = mysqli_init(); //crio um conector
    //executo a conexao passando os parametros
    $succes = mysqli_real_connect(
                  $conector,
                  $host,
                  $user,
                  $password,
                  $database,
                  $port
              );

    return $conector;//retorno a conexao com o banco de dados
  }

  /**
   * [db_off fechar a conexao com o banco de dados]
   * @param  [conector] $db [conector do banco de dados]
   * @return [type] [description]
   */
  function db_off($db){
    mysqli_close($db);
  }

  /**
   * [sql_execute executa um comando sql no banco de dados]
   * @param  [text] $query [query a ser executada no banco de dados]
   * @param  [conector] $db [conector do banco de dados]
   * @return [text] $result [resultado da query que foi executada]
   */
  function sql_execute($db, $query){
    //executar um comando sql
    $result = $db->query($query);
    return $result;
  }


?>
