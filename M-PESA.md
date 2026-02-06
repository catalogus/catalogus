Getting Started

Introduction

Welcome to M-Pesa's Developer Portal! In this web portal, we have exposed API endpoints and provided an automated workflow to easily integrate with M-Pesa Payments Gateway for accessing and using M-Pesa services. The M-Pesa API endpoints that have been exposed includes services for customer to business (C2B), reversals and transaction status queries interactions.

Sign-up

To use our APIs or invoke an API endpoint, you will need to register for an account. By registering an account, you will be able to access all the needed API package information in order to develop your own call to M-Pesa.

An account activation link will be sent in an email to the email address used in registration. When signing in, you will be required to add your phone number as the final step to register and activate your account. Once the account has been activated, you will have access to the API documentation and will be able to test API calls to M-Pesa Payments Gateway.

Navigation

Once logged in, you will have access to the following additional pages:

    APIs

    Detailed documents for the available exposed APIs. Currently we offer the C2B (Customer to Business), Reversals and Transaction Status Query APIs. More will be added in due time. The developer will be able to build the necessary header and request package content that needs to be fired as well as view the associated response package. To get you started, we have provided code samples in Java and Python.
    Reports

    From the Reports tab, you can gauge how your API is performing over a period of time. Transaction details for the API invoked will be able to be viewed in both Table and Chart format.
    Account Profile

    From the My Profile tab, you can update personal details and update account details (username and password). During registration, an API Key has been created automatically and assigned to your profile. You are also able to renew the API key used to authenticate your account credentials when using the various exposed APIs. Once the development is complete and testing was successful, you will be able to post your account details and transaction reports to Vodafone M-Pesa personnel who will verify the development before taking your service live on M-Pesa.

Developing your API

Overview

The APIs that have been exposed are clearly documented in their respective sections. Following along with the structure and parameters will allow you to rapidly build the correct API package to seamlessly integrate with Mobile Money services, allowing for convenient payment opportunities for your business and your customers.

RESTful APIs

The APIs exposed are RESTful APIs that break down transactions into a series of small modules, each addressing an underlying part of the transaction. The REST APIs provide developers with all the tools to effectively interact with the M-Pesa Payments Gateway using the API.

Library File Inclusion

A library file has been provided to facilitate the authentication and communication with the M-Pesa Payments Gateway server. For example: "portal-sdk.jar" for the JAVA programmers. The Library file can be downloaded and included in your development environment (e.g. Eclipse, Maven, etc.). The library file encrypts the user's API Key and Public Keys. Should you wish to build your API package without the use of the library file inclusion you can follow along with the steps in the "Develop without Library File" section.

Configuration

When registering for a developer account on the Integration Portal, you will receive access to your API Key and your Public Key in your Account Profile [link to Account/Profile]. The API Key and Public Key are used to authorize and authenticate your account on the M-Pesa Payments Gateway System. Once authenticated and authorized, your API can be initiated. You are able to renew your API key by going to your Account Profile and clicking on "Renew API Key". Remember to include the new API key in your actual request package.

DEVELOPMENT: API Structure

Development of the API starts by including/importing your SDK dependency file from the Library. Once imported, the API structural development will be comprised out of 3 sections. First, configure the context declaration used during communication. Next, include the request parameters for the relevant call. Finally, print out the response parameters received through the communication channel.

    CONTEXT DECLARATION
        API Key and Public Key

        Use the API Key and Public Key of your account profile within your API to authenticate and authorize your call on the M-Pesa Payments Gateway system. The API Key and Public Key is found within the Accounts Profile page. The Public Key is used in your package and the accompanied referenced Library file to automatically encrypt your API Key. The API page includes the sample code that automatically generates the package with your unique API Key and Public Key
        SSL Security

        Set if your API will communicate over a secure SSL channel. Setting the SSL to true will ensure the communication of the API data will be encrypted.
        Method Type

        The method type context will contain the REST verb to be used in the specific API call. "POST" is used to initiate the communication to the listed Resource URL. Other verbs able to be used are "GET" and "PUT", depending on the relevant API call.
        Resource URL

        The Resource URL box provides the address, port and path that needs to be specified as the context in the API call. The resource URL is used to direct the API to the corresponding entry point of the Transaction Switch on the M-Pesa Payments Gateway to correctly process the API call and initiate the payment.
    DEVELOPING WITHOUT A LIBRARY

    The library file facilitates the authentication of the user on the Payment Gateway system. Should you wish to build your own API package from the ground you will need to follow the steps below to encrypt your API Key and establish your own connection with the M-Pesa Payments Gateway. We suggest going this route if you are an established developer. The header section of the API contains an Authorization Bearer field. This field requires the encrypted API Key using your Public Key.
    Authorization Bearer Encryption

    Authorization Bearer is a Base64 encoded string of the API Key after it was encrypted by the Public Key on the server.The Public Key is a 4096 bit RSA cipher that is encoded using Base64. The API Key is a 32 length string uniquely identifying your account. Both the Public Key and the API Key can be found in the Account Profile Page on the Accounts Profile page.
    Steps to follow
        Get Public Key from Account Profile page
        Get API Key from Account Profile page
        Generate a decoded Base64 string from the Public Key
        Generate an instance of an RSA cipher and use the decoded Base64 string as the input
        Encode the API Key with the RSA cipher and digest as Base64 string format
    Below is the sample of how to encrypt your API Key and how the final header should look
        Public Key:

        MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAszE+xAKVB9HRarr6/uHYYAX/RdD6KGVIGlHv98QKDIH26ldYJQ7zOuo9qEscO0M1psSPe/67AWYLEXh13fbtcSKGP6WFjT9OY6uV5ykw9508x1sW8UQ4ZhTRNrlNsKizE/glkBfcF2lwDXJGQennwgickWz7VN+AP/1c4DnMDfcl8iVIDlsbudFoXQh5aLCYl+XOMt/vls5a479PLMkPcZPOgMTCYTCE6ReX3KD2aGQ62uiu2T4mK+7Z6yvKvhPRF2fTKI+zOFWly//IYlyB+sde42cIU/588msUmgr3G9FYyN2vKPVy/MhIZpiFyVc3vuAAJ/mzue5p/G329wzgcz0ztyluMNAGUL9A4ZiFcKOebT6y6IgIMBeEkTwyhsxRHMFXlQRgTAufaO5hiR/usBMkoazJ6XrGJB8UadjH2m2+kdJIieI4FbjzCiDWKmuM58rllNWdBZK0XVHNsxmBy7yhYw3aAIhFS0fNEuSmKTfFpJFMBzIQYbdTgI28rZPAxVEDdRaypUqBMCq4OstCxgGvR3Dy1eJDjlkuiWK9Y9RGKF8HOI5a4ruHyLheddZxsUihziPF9jKTknsTZtF99eKTIjhV7qfTzxXq+8GGoCEABIyu26LZuL8X12bFqtwLAcjfjoB7HlRHtPszv6PJ0482ofWmeH0BE8om7VrSGxsCAwEAAQ==

        API Key:

        aaaab09uz9f3asdcjyk7els777ihmwv8

    The Header for each API requests contains the following required format

    Authorization: Bearer (Encoded API Key)

    Using the Steps to follow, and the Sample Code below, you should derive with the following for the Authorization Bearer

    Authorization: Bearer rfNjFso4uJbzhwl8E9vizqmHEuD7XDmPqfsRx1L62UoTmURGGLAGgJSl9lCPbgy03Q7NwozFYD4r9BFQY5QpvErHximBDU8HE25urVahm0HnB8VyCIobs684XGSN4GjdequePDrG6xUAxxpvmhqZRlGt1tUjUBeBg6kYqp4EnKHsiaBtvd0THGLZbefpT6UaShASQWYNiEPwEon5wtUMaDwnyQEazDu1H2ieN3r8cCVM3hsak59J/1MP07FQjdFbxdCLfA0DuxgpeKpvLs7WrA767WJSB1QZy7hcP1igSGRfd7Zrp6E7gIukdpC0DApqPKa4XsNTo2AMpG4AwiET2WeKvHn539gbwREXf79kZlYdFDCgTc0Zs7OfDx5ZXMCBKHOS/H3tVFJqXTfEfIF5LOzrFU5pPE0HeNBV0Q2vm8qRwQX0RijnvMOGpdcmXb0qoph4oy8Mj+vjRfFRboMAafttDozBhRmWEmeBB3EjYASm1fToQp5ey6ltCiEt8rjL5PlexxB0u3u2LVJQcDzMVNiiq10t1xyw8qtc6BMOyrKVlIANWglRYOKr9saVBVvDFUcCfsghMjUTDeAwHom4A3cSDWmVlNF9Vs/WqCoUzjQCV0BFPDzeAUbQqt7h7OgFno/+D9n5j1eMro0aXbbHNx71u8YmgPJhdixzFhxM1Pw=

    Developer Sample Code to generate the encrypted authorization Bearer from the API Key and the Public Key:

    import javax.crypto.Cipher;
    import java.security.KeyFactory;
    import java.security.PublicKey;
    import java.security.spec.X509EncodedKeySpec;

    // Download: https://commons.apache.org/proper/commons-codec/download_codec.cgi
    import org.apache.commons.codec.binary.Base64;

    public class Main {

        public static void main(String[] args) {
            String publicKey = "MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAszE+xAKVB9HRarr6/uHYYAX/RdD6KGVIGlHv98QKDIH26ldYJQ7zOuo9qEscO0M1psSPe/67AWYLEXh13fbtcSKGP6WFjT9OY6uV5ykw9508x1sW8UQ4ZhTRNrlNsKizE/glkBfcF2lwDXJGQennwgickWz7VN+AP/1c4DnMDfcl8iVIDlsbudFoXQh5aLCYl+XOMt/vls5a479PLMkPcZPOgMTCYTCE6ReX3KD2aGQ62uiu2T4mK+7Z6yvKvhPRF2fTKI+zOFWly//IYlyB+sde42cIU/588msUmgr3G9FYyN2vKPVy/MhIZpiFyVc3vuAAJ/mzue5p/G329wzgcz0ztyluMNAGUL9A4ZiFcKOebT6y6IgIMBeEkTwyhsxRHMFXlQRgTAufaO5hiR/usBMkoazJ6XrGJB8UadjH2m2+kdJIieI4FbjzCiDWKmuM58rllNWdBZK0XVHNsxmBy7yhYw3aAIhFS0fNEuSmKTfFpJFMBzIQYbdTgI28rZPAxVEDdRaypUqBMCq4OstCxgGvR3Dy1eJDjlkuiWK9Y9RGKF8HOI5a4ruHyLheddZxsUihziPF9jKTknsTZtF99eKTIjhV7qfTzxXq+8GGoCEABIyu26LZuL8X12bFqtwLAcjfjoB7HlRHtPszv6PJ0482ofWmeH0BE8om7VrSGxsCAwEAAQ==";
            String apiKey = "aaaab09uz9f3asdcjyk7els777ihmwv8";

            System.out.println(getBearerToken(apiKey, publicKey));
        }

        private static String getBearerToken(String apiKey, String publicKey) {
            try {
                KeyFactory keyFactory = KeyFactory.getInstance("RSA");
                Cipher cipher = Cipher.getInstance("RSA");
                byte[] encodedPublicKey = Base64.decodeBase64(publicKey);
                X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(encodedPublicKey);
                PublicKey pk = keyFactory.generatePublic(publicKeySpec);

                cipher.init(Cipher.ENCRYPT_MODE, pk);
                byte[] encryptedApiKey =  Base64.encodeBase64(cipher.doFinal(apiKey.getBytes("UTF-8")));

                return new String(encryptedApiKey, "UTF-8");
            } catch (Exception e) {
                System.out.println(e.getMessage());
            }

            return null;
        }
    }

    REQUEST PARAMETERS

    The second section involves stating the Request Parameters needed for your call. Each API is documented with the parameter name and a description for its intended use. The data type is matched to the parameter name. There is also an indication whether the specific parameter is required or optional. Possible values are provided for each parameter and can be used as an example. The sample code is built up in the Example Package in various languages to allow for quick reference and rapid development. Each API call's Request Parameter will be relevant to its specific needs.
    RESPONSE PRINTOUT

    The final section of the API Structure includes the printout of the response parameters. The Response Package sent from the Payment Gateway will include a status code with an accompanying description of the nature/status of the transaction. The Code and Description can be matched to the corresponding table on the API page that provides necessary information.
    ASYNCHRONOUS TRANSACTIONS

By default, the APIs work in synchronous mode. To change them to asynchronous, the asynchronous response endpoint URL must be registered on the Account page. Registration is done by filling in the Asynchronous Response URL's text box and clicking on the Update button to save the changes. This will set all of the API's to asynchronous. To change them back to synchronous the URL must be cleared and the changes must be saved.

Please note that:

        Only secure HTTP (https) connections are allowed;
        The allowed port range is [11000,19000]. Asynchronous requests will not be sent to endpoints listening on ports which are outside of this range.
    SAMPLE REQUEST

    To provide a working example, each API page has a Request Box with built up sample code. Clicking the “Send Request” button will bring up a popup box with all the required parameters to send the API call. Inside the Header section is the context: the REST Verb used to send the instruction to the appropriate Resource URL (including address, port and path). Also included in the Header section is an encrypted format of the API Key and Public Key used to authenticate the user on the Payment Gateway System.

    The body of the API is used to send the Request Parameters. This box is editable and contains detail about the transaction as "input". When hitting "send", the Request Package will be sent to a sandbox testing system within the M-Pesa Payments Gateway. MPesa Payments Gateway will action the API instruction and test the input parameters to see if it is valid and will proceed to initiate the transaction.

    The response package will be provided and will contain details about the transaction, including all the request parameters originally sent as “input” during the request package. This allows the user to verify if the transaction information is indeed correct. The Output result code and description will be returned to indicate the status of the transaction.

