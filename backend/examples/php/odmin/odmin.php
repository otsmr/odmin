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
            
            if (!is_null($session)) {
                
                try {
                    
                    $session = json_decode($session);
        
                    if ($session->session_token) {
                        setcookie("odmin_token", $session->session_token, time()+3600*30*60, "/", "", true, true);
                        return true;
                    }
        
                } catch (Exception $e) {
                    // print($e);
                }
            
            }
            
            return false;         

        }

        public function handle_continue_location (string $default_location) : void {

            function to_default () {
                global $default_location;
                // print("Location: $default_location");
                header("Location: $default_location");
                die();
            }
            
            if(isset($_GET['continue']) && $_GET['continue'] !== "null") {

                $continue = (string) urldecode((string) $_GET['continue']);
                
                if (
                    ($continue[0] === "/" || $continue[0] === ".") &&
                    strrpos($continue, "http:") === false &&
                    strrpos($continue, "https:") === false
                ) {
                    // print("Location: $continue");
                    header("Location: $continue");
                    die();
                }
            
            }

            to_default();

        }

        public function init_session_from_cookie () {

            if (!isset($_COOKIE["odmin_token"])) return false;

            $token = (string) $_COOKIE["odmin_token"];

            $user_data = fetch::post($this->api_base . "api/v0/service/getuserfromtoken", [
                "token" => $token,
                "secret" => $this->secret
            ]);

            if (is_null($user_data)) {
                $this->handle_logout();
                return false;
            }

            try {
                    
                $user_data = json_decode($user_data);
    
                if (isset($user_data->error) && $user_data->error) {
                    return false;
                }

                if (!isset($this->session->user_id)) {
                    return false;
                }

                $this->session->user_id = (int) $user_data->user_id;
                $this->session->user_name = (string) $user_data->user_name;
                
                $this->session->token = $token;
                
            } catch (Exception $e) {
                print($e);
            }
           

            return true;

        }

        public function handle_logout (int $status) : void {

            setcookie("odmin_token", "", time()-3600, "/", "", true, true);

        }

        public function is_logged_in () : bool {

            return ($this->session->token === "") ? false : true;

        }

        public function get_signin_url (string $continue = "/"): string {

            $continue = urlencode($continue);
        
            return $this->api_base . "api/v0/service/user/sigin?serviceid=" . $this->service_id . "&continue=" . $continue;
            
        }
        
        public function get_signout_url (string $continue = "/"): string {
            
            $continue = urlencode($continue);

            return $this->api_base . "api/v0/user/logout/" . $this->session->token . "/" . $this->service_id . "?continue=" . $continue;

        }

    }


    class fetch {
    
        function post ($url, $data=NULL) {

            // print_r("POST: $url<br>");
    
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
            if(!empty($data)){
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        
            curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                'Content-Type: application/json'
            ));
        
            $response = curl_exec($ch);
        
            if (curl_error($ch)) {
                return NULL;
            }
        
            curl_close($ch);
            return $response;
    
        }
    
    }

}