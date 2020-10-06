
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken} from '../../auth/JwtToken'

const cert = `MIIDDTCCAfWgAwIBAgIJRmHGr3jfvvgvMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV\
BAMTGWRldi1mYWRkZno0di51cy5hdXRoMC5jb20wHhcNMjAxMDAzMDY1NTU4WhcN\
MzQwNjEyMDY1NTU4WjAkMSIwIAYDVQQDExlkZXYtZmFkZGZ6NHYudXMuYXV0aDAu\
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzVzV9g9dlZN4CTSs\
eNBnx0pW7ao9lNDprFCgYkY0BLW4JvEjs/2cMqLMPRj1ix8+k5x5cPrwKLtgRhQp\
pqDRYLweUlLo0btoPFecIHYLGUokMHOBF6wWiQ7xduQQlKtBuWJlMwb/TgcYsZQj\
Dwu4YTxAYBKjt6Af+LYN46MfMVbV7HHz7VEaY1TAz7tl85ldheu+2asidUTOlYcT\
kcBto0kYAD8mJu1SIXfz4ybGFPCmc1UFOq/uS9i6DNc/x3FO4pCWN/oDoarAGxgL\
4tpuDag2g47N4iCjK1YMgyBj9fvGFopgJ58suAg0rdEQDEcCgmcIBQqotih8Or7T\
I4KpsQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSUJ0t26H25\
bOh9TZs7nOKibAspuTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB\
AB2Rt9uqRTbIfKmXdM0xOi9QWkYc3vmZcqk5Cgfft6zHw7XPRIdxyNSB4fdgxXiv\
sUUvaVxPpjk35CghmXqUrxnFhH2SaOO2HMnHTSyX1EHlV4VlVAhVQ6ASuGGHHY0D\
XtKGSrsyHZ0NkH6/eSb2VrRPyZ/cprfBOAtHm3U3rx2/Qnz7w5pbh150ZdVn7dJn\
NXD0GHqECEfK9VJLqSgxDMou/DbYHuCbYSsVroRBDfqIR8Ugzv7zgjrWiHSkKFYC\
iMQmSM8OH4QLc6S3kKtIY+78JA/Y/mx4sqZ4SZ8TaZfT074aSEhq6El52tVdP1SU\
ivPZG7/qf4h7Hhlw2pO8xAI=`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User was not authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256']}) as JwtToken
}
