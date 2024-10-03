import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

class RpcBadErrorException extends RpcException {
  constructor(message:string) {
    super({
      message,
      status:HttpStatus.BAD_REQUEST
    });
  }
}

// Excepción para ID negativo o cero (400 Bad Request)
class  RpcNotFoundErrorException extends RpcException {
  constructor(message:string) {
    super({
      message,
      status: HttpStatus.NOT_FOUND,
    });
  }
}
class  RpcNoContentException extends RpcException {
  constructor(message:string) {
    super({
      message,
      status: HttpStatus.NO_CONTENT,
    });
  }
}
export {
  RpcNotFoundErrorException,
  RpcBadErrorException,
  RpcNoContentException
}