import bunyan from 'bunyan';
import appConfig from '../configs/appConfig';

const streams: any[] = [];
const name = `MAX-VEHICLE-SERVICE-${appConfig.ENV || ''}`.toUpperCase();

if (appConfig.ENV === 'production') {
  streams.push({
    stream: process.stdout,
    level: 'debug'
  });
} else {
  streams.push({
    stream: process.stdout,
    level: 'debug'
  });
}

export const LoggingService = bunyan.createLogger({
  name,
  streams,
  serializers: bunyan.stdSerializers
});
