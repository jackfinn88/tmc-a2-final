<?php
	class MyAPI
	{
		private $rc = 500;
		private $data = null;
		private $database = null;
		
		public function __construct()
		{
			$this->data = array();
			$this->database = new mysqli("itsuite.it.brighton.ac.uk", "jlf40", "jlf40", "jlf40_weba2db");
		}
		
		public function __destruct()
		{
			$this->database->close();
		}
		
		public function handleRequest()
		{
			if($_SERVER['REQUEST_METHOD'] === 'GET')
			{
				if(isset($_GET['input']))
				{
				$this->getBooks();
				}
				else if(isset($_GET['id']))
				{
				$this->getRoom();
				}
			}
			else if($_SERVER['REQUEST_METHOD'] === 'POST')
			{
				$this->updateItem();
			}
			else
			{
				$this->rc = 400;
			}
			
			http_response_code($this->rc);
			
			if($this->rc == 200 || $this->rc == 201)
			{
				header('content-type: application/json');
				echo json_encode($this->data, JSON_PRETTY_PRINT);
			}
		}
		
	//////////////////////////////////////////////////////
	// GET DATA FROM TABLE resource IN DB jlf40_webA2db //
	//////////////////////////////////////////////////////
		
		private function getBooks()
		{
			if(isset($_GET['input']))
			{
				$sql = "SELECT * FROM resource WHERE title LIKE '%".$_GET['input']."%' OR author LIKE '%".$_GET['input']."%' OR descr LIKE '%".$_GET['input']."%'";
				$result = $this->database->query($sql);
				
				if ($result->num_rows)
				{
					// output data of item
					while($row = $result->fetch_assoc())
					{
						$this->data[] = $row;
							
						$this->rc = 200;
					}
				}
				else
				{
					$this->rc = 204;
				}
			}
			else
			{				
				$this->rc = 400;
			}
		}
		
		private function getRoom()
		{
			if(isset($_GET['id']))
			{				
				$sql = "SELECT * FROM ".$_GET['id'];
				$result = $this->database->query($sql);
				
				if ($result->num_rows)
				{
					// output data of item
					while($row = $result->fetch_assoc())
					{
						$this->data[] = $row;
							
						$this->rc = 200;
					}
				}
				else
				{
					$this->rc = 204;
				}
			}
			else
			{				
				$this->rc = 400;
			}
		}
		
	/////////////////////////////////////////////////////
	// UPDATE data IN TABLE people IN DB jlf40_webA2db //
	/////////////////////////////////////////////////////		
		
		private function updateItem()
		{			
			if(isset($_POST['isbn'], $_POST['avCopies']))
			{
				$isbn =  $_POST['isbn'];
				$avCopies = $_POST['avCopies'];
				
				$sql = "UPDATE resource SET avCopies='"
					. $this->database->real_escape_string($avCopies)
					. "' WHERE isbn='" . $isbn . "'";
							
				$result = $this->database->query($sql);
				
				if ($result !== false)
				{						
					$this->rc = 201;
				}
				else
				{
					$this->rc = 500;
				}
			}
			else
			{				
				$this->rc = 400;
			}
		}
	}
	
	$api = new MyAPI();
	$api->handleRequest();
?>