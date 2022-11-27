var PROTO_PATH = __dirname + '/../protos/Calculate.proto';
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });
var hello_proto = grpc.loadPackageDefinition(packageDefinition).hello; //hello is proto package name.

function calculate(call){ //双端流式
  call.on('data', function(operand) {
    var finish = false;
    var res = {val: 0};
    // console.log(operand.opr);
    switch(operand.opr){
      case "ADD":
        res.val = operand.op1 + operand.op2;
        break;
      case "SUB":
        res.val = operand.op1 - operand.op2;
        break;
      case "MUL":
        res.val = operand.op1 * operand.op2;
        break;
      default:
        finish = true;
        break;
    }
    // console.log(res.val);
    if(finish) call.end();
    else call.write(res);
  })
}

function main(){ //create server and start.
  var server = new grpc.Server();
  server.addService(hello_proto.Calculator.service, { //Calculator is service name.
    calculate: calculate, //calculate is the rpc function name in service
  });
  server.bindAsync('127.0.0.1:8888', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
  });
}
main();