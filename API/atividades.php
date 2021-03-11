<?php
  ini_atividades();

  function ini_atividades(){
    $cmd = $_POST['cmd'];

    if(strtoupper($cmd) == strtoupper("salvarAtividade")){
      //se mandar no dados o id da atividade ele considera como uma edicao, se nao ele considera como um dado de atividade novo
      salvarAtividade($_POST['dados'], $_POST['usuario'], $_POST['email']);
    }elseif(strtoupper($cmd) == strtoupper("listaAtividades")){
      listaAtividades($_POST['usuario'], $_POST['email'], $_POST['historicoSN']);
    }elseif (strtoupper($cmd) == strtoupper("deletaAtividade")) {
      deletaAtividade($_POST['dados']);
    }
  }

  /**
   * [salvarAtividade salva a atividade no banco de dados]
   * @param  [type] $dados   [dados da tela como nomeAtividade, dtAtividade, hrAtividade e descricao]
   * @param  [type] $usuario [usuario que esta logado no sistema]
   * @param  [type] $email   [e-mail do usuario logado no sistema]
   * @return [json] $retorno [retorno de sucesso ou erro quando salvamos a atividade no banco de dados]
   */
  function salvarAtividade($dados, $usuario, $email){
    //pegar valor do VIEW
    $dcDados = json_decode($dados,true);

    //comparo para saber se a atividade tem um nome valido
    if(empty($dcDados['nomeAtividade'])){
      $array = array("code" => 9, "status" => "Inserir um nome valido para a atividade");
      echo json_encode($array);
      return;
    }

    //verifico se a data esta preenchida
    if(empty($dcDados['dtAtividade'])){
      $array = array("code" => 10, "status" => "Inserir uma data valida");
      echo json_encode($array);
      return;
    }

    if($dcDados['dtAtividade'] == "Escolha uma data valida"){ //verifico se o usuario nao colocou uma data
      $array = array("code" => 10, "status" => "Inserir uma data valida");
      echo json_encode($array);
      return;
    }

    //verifico se a data é no passado, se é uma data no passado mando um alerta dizendo que nao posso cadastrar a atividade
    $hj = date('Y-m-d H:i:s');
    $dtHrAtiv = $dcDados['dtAtividade'] . " " . $dcDados['hrAtividade'];

    if(strtotime($hj) >= strtotime($dtHrAtiv)){
      $array = array("code" => 11, "status" => "Não podemos cadastrar uma atividade no passado");
      echo json_encode($array);
      return;
    }

    $dcDados['dtHrAtiv'] = $dtHrAtiv;

    if(empty($dcDados['idAtividade'])){
      salvaNovaAtividade($dcDados, $usuario, $email);
    }else{
      editAtividade($dcDados, $usuario, $email);
    }

  }

  /**
   * [salvaNovaAtividade Salva uma nova atividade]
   * @param  [type] $dcDados [dados da tela depois da confirmação]
   * @param  [type] $usuario [usuario do sistema]
   * @param  [type] $email   [email do usuario]
   * @return [json] retorno  [retorna se conseguiu ou nao adicionar a atividade]
   */
  function salvaNovaAtividade($dcDados, $usuario, $email){
    //pego o id da atividade
    $idUsuario = getIdUsuario($usuario, $email);

    if($idUsuario == 0){
      //envio a resposta para o front
      $array = array("code" => 12, "status" => "Desculpe, mas perdemos sua conexão, favor logar novamente no sistema. Obrigado");
      echo json_encode($array);
      return;
    }

    //conecto no banco de dados
    $db = db_on();

    //crio a query para salvar no banco de dados a atividade
    $query = "insert into tb_atividade (nomeAtividade, dtAtividade, descriAtividade, usu_idUsuario, atividadeValidaSN) values('" .
                                                                                                            $dcDados['nomeAtividade'] ."','" .
                                                                                                            $dcDados['dtHrAtiv'] . "','" .
                                                                                                            $dcDados['descriAtividade'] . "'," .
                                                                                                            $idUsuario . "," .
                                                                                                            "'S'" .
                                                                                                          ")";

    $retorno = sql_execute($db,$query);

    db_off($db);

    if($retorno == 1){
      //envio a resposta para o front
      $array = array("code" => 13, "status" => "Atividade salva com sucesso");
      echo json_encode($array);
      return;
    }else{
      //envio a resposta para o front
      $array = array("code" => 14, "status" => "Encontramos um erro ao salvar");
      echo json_encode($array);
      return;
    }
  }

  /**
   * [editAtividade edita a atividade]
   * @param  [type] $dcDados [dados da tala ja confirmados]
   * @param  [type] $usuario [usuario logado no sistema]
   * @param  [type] $email   [email do usuario logado no sistema]
   * @return [json] retorno  [retorna se conseguiu editar ou nao a atividade]
   */
  function editAtividade($dcDados, $usuario, $email){
    //preparo a query para o uso no banco de dados
    $query = "update tb_atividade set nomeAtividade='" . $dcDados['nomeAtividade'] . "', dtAtividade='" . $dcDados['dtHrAtiv'] . "', descriAtividade='" . $dcDados['descriAtividade'] . "' where idAtividade=" . $dcDados['idAtividade'];

    //conecto no banco de dados
    $db = db_on();

    $retorno = sql_execute($db,$query);

    db_off($db);

    if($retorno == 1){
      //envio a resposta para o front
      $array = array("code" => 13, "status" => "Atividade alterada com sucesso");
      echo json_encode($array);
      return;
    }else{
      //envio a resposta para o front
      $array = array("code" => 14, "status" => "Encontramos um erro ao salvar");
      echo json_encode($array);
      return;
    }

  }

  /**
   * [listaAtividades lista as atividades futuras para serem feitas]
   * @param  [type] $usuario [usuario logado no sistema]
   * @param  [type] $email   [email do usuario logado ao sistema]
   * @param  [type] $historicoSN [se é pra trazer o historico ou a lista de atividades ainda nao realizadas]
   * @return [json] $retorno [retorno das atividades a serem realizadas]
   */
  function listaAtividades($usuario, $email, $historicoSN){
    //pego o id do usuario logado no banco de dados
    $idUsuario = getIdUsuario($usuario, $email);

    //crio o conector com o banco
    $db = db_on();

    //verifico se a data é no passado, se é uma data no passado mando um alerta dizendo que nao posso cadastrar a atividade
    $hj = date('Y-m-d H:i:s');

    //verifico se é historico ou lista de atividades futuras
    if(strtoupper($historicoSN) == strtoupper('s')){
      $query = "select * from tb_atividade where usu_idUsuario = $idUsuario and dtAtividade <= '$hj' and atividadeValidaSN = 'S' order by dtAtividade asc;";
    }else{
      $query = "select * from tb_atividade where usu_idUsuario = $idUsuario and dtAtividade >= '$hj' and atividadeValidaSN = 'S' order by dtAtividade asc;";
    }

    $retorno = sql_execute($db, $query);

    if($retorno->num_rows == 0){
      //envio a resposta para o front
      $array = array("code" => 15, "status" => "Não encontramos atividades");
      echo json_encode($array);
      return;
    }

    //crio um arrau de atividades
    $arrayAtividades = array();

    //vou em cada linha da minha resposta sql e salvo no array atividades
    while ($row = mysqli_fetch_array($retorno)) {
      $row['dt'] = date("Y-m-d", strtotime($row['dtAtividade']));
      $row['hr'] = date("H:i", strtotime($row['dtAtividade']));
      $row['dtAtividade'] = date("d/m/Y H:i:s", strtotime($row['dtAtividade']));
      array_push($arrayAtividades, $row);
    }

    //envio a resposta para o front
    $array = array("code" => 16, "status" => "Lista de atividades", "atividades" => $arrayAtividades);
    echo json_encode($array);
    return;

  }

  /**
   * [getIdUsuario pego id do usuario de acordo com o nome e email do usuario]
   * @param  [type] $usuario [usuario que esta logado no sistema]
   * @param  [type] $email   [e-mail do usuario logado no sistema]
   * @return [int] $idUsuario [id do usuario logado]
   */
  function getIdUsuario($usuario, $email){
    //conecto no banco de dados
    $db = db_on();

    //verifico o usuario q esta conectado e pego o id dele
    $query = "select * from tb_usuario where nomeUsuario = '$usuario' and emailUsuario = '$email'";

    $retorno = sql_execute($db, $query);

    if($retorno->num_rows == 0){
      return 0;
    }
    //transformo a resposta da sql em array
    $row = mysqli_fetch_array($retorno);
    $idUsuario = $row['idUsuario'];//salvo o id do usuario

    db_off($db);

    return $idUsuario;
  }

  /**
   * [deletaAtividade faco a verificaçcao e excluo a atividade]
   * @param  [type] $dados [Dados da tela] {"table_atividade_length":"10","idAtividade":"XX"}
   * @return [json] retorno[Retorno para o front se exclui ou nao]
   */
  function deletaAtividade($dados){

    /**
     * [deletar_atividade deleto a atividade]
     * @param  [type] $id [id da atividade para excluir]
     */
    function deletar_atividade($id){
      //conecto no banco de dados
      $db = db_on();
      //monto a query
      $query = "delete from tb_atividade where idAtividade='" . $id . "'";
      //executo a query
      $retorno = sql_execute($db, $query);
      //desligo a conexão com o banco
      db_off($db);
    }

    //pego o dados da tela e transformo em um array
    $dcDados = json_decode($dados, true);
    //conto se o idAtividade veio como array ou como dados;
    $contDados = count($dcDados['idAtividade']);

    if (empty($dcDados['idAtividade'])){ //verifico se existe dados para serem deletados
      //envio a resposta para o front
      $array = array("code" => 18, "status" => "Não encontramos dados para serem deletados");
      echo json_encode($array);
      return;
    }else{//existe dados
      if($contDados >= 2){ //verifico quantos id veio em meu json
        foreach ($dcDados['idAtividade'] as $key => $value) {
          deletar_atividade($value);
        }
      }else{//existe apenas 1 item para ser deletado
        deletar_atividade($dcDados['idAtividade']);
      }
      //envio a resposta para o front
      $array = array("code" => 17, "status" => "Excluímos com sucesso");
      echo json_encode($array);
      return;
    }
  }



?>
