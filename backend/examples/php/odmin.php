<?php

namespace ODMIN {

    class OAuth {

        private string $secret;
        private string $service_id;
        private string $api_base;

        public object $session;

        public function __construct (object $config) {

            $this->secret = $config->secret;
            $this->service_id = $config->service_id;
            $this->api_base = $config->api_base;

            $this->session = (object) [
                "token" => "",
                "user_id" => -1,
                "user_name" => ""
            ];

        }

        public function handle_oauth_code (string $code): bool {

            $session = fetch::post($this->api_base . "api/v0/service/getsessionfromcode", [
                "code" => $code,
                "secret" => $this->secret
            ]);
            
            if ($session !== NULL) {

                try {
        
                    $session = json_decode($session);
        
                    if ($session["session_token"]) {
                        setcookie("odmin_token", $session["session_token"], time()+3600*30*60, "/");
                        return true;
                    }
        
                } catch (Exception $e) {
                    print($e);
                }
            
            }
            
            return false;         

        }

        public function init_session_from_cookie () {

            if (!isset($_COOKIE["odmin_token"])) return false;

            $token = (string) $_COOKIE["odmin_token"];

            $user_data = fetch::post($this->api_base . "api/v0/service/getuserfromtoken", [
                "token" => $token,
                "secret" => $this->secret
            ]);

            if ($user_data === NULL) {
                setcookie("odmin_token", "", time()-3600);
                return false;
            }

            $this->session->token = $token;

            $this->session->user_id = (int) $user_data["user_id"];
            $this->session->user_name = (string) $user_data["user_name"];

            return true;

        }

        public function is_logged_in () : bool {

            return ($this->session->token === "") ? false : true;

        }

        public function get_signin_url (string $continue = "/"): string {

            $continue = urlencode($continue);
            
            return $this->api_base . "/signin?serviceid=" . $this->service_id . "&continue=" . $continue;
            
        }
        
        public function get_signout_url (string $contine = "/"): string {
            
            $continue = urlencode($continue);

            return $this->api_base . "/api/v0/user/logout/" . $session->token . "?serviceid=" . $this->service_id . "&continue=" . $continue;

        }

    }


    class fetch {
    
        function post ($url, $data=NULL, $headers = NULL) {
    
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
            if(!empty($data)){
                curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
            }
        
            if (!empty($headers)) {
                curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            }
        
            $response = curl_exec($ch);
        
            if (curl_error($ch)) {
                return NULL;
            }
        
            curl_close($ch);
            return $response;
    
        }
    
    }

}