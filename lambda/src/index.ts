import { Callback, CloudFrontResponseEvent, Context } from 'aws-lambda';
import { ResponseCodeMap } from './interface/response-code';
import { isFileSupported } from './domain/extention';
import { isAllowCombination, of } from './domain/dimentaion';
import ParseIntSupport from './lib/support/parse-int';
import S3Api from './infra/external/s3Api';
import Resizer from './infra/external/resizer';
import {Logger} from "./lib/support/logger";

const bucketName = process.env.BUCKET_NAME ?? '';
const s3Api = new S3Api(bucketName);
const resizer = new Resizer(s3Api);

// See https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-event-structure.html
const handler = async (
  event: CloudFrontResponseEvent,
  context: Context,
  callback: Callback,
) => {
  const { request, response } = event.Records[0].cf;

  const responseOriginal = () => {
    callback(null, response);
  };

  const responseNotFound = () => {
    response.status = ResponseCodeMap.RESPONSE_OK;
    response.headers['content-type'] = [
      { key: 'Content-Type', value: 'text/plain' },
    ];
    callback(null, response);
  };

  const responseError = () => {
    response.status = ResponseCodeMap.RESPONSE_ERROR;
    response.headers['content-type'] = [
      { key: 'Content-Type', value: 'text/plain' },
    ];
    callback(null, response);
  };

  try {
    const logger = await Logger()
    logger.log({
      level: 'info',
      message: 'event received',
      params: event
    })
    // Cloudfrontが304を返した場合はそのまま返す
    if (response.status === ResponseCodeMap.RESPONSE_ORIGINAL) {
      responseOriginal();

      return;
    }

    // 200OK以外の場合は、403を返す(s3のレスポンスがファイルがない場合は403)
    if (response.status !== ResponseCodeMap.RESPONSE_OK) {
      responseNotFound();

      return;
    }

    const filepath = decodeURIComponent(request.uri);
    if (!isFileSupported(filepath)) {
      responseOriginal();

      return;
    }

    const url = new URL(request.uri);
    const width = url.searchParams.get('w');
    const height = url.searchParams.get('h');

    if (!width || !height) {
      responseOriginal();

      return;
    }

    if (!isAllowCombination(ParseIntSupport(width), ParseIntSupport(height))) {
      responseOriginal();

      return;
    }

    const dimention = of(ParseIntSupport(width), ParseIntSupport(height));

    try {
      await resizer.resize(filepath, dimention);
      response.status = ResponseCodeMap.RESPONSE_OK;

      callback(null, response);
    } catch {
      console.error('failed resize');
      responseOriginal();
    }
  } catch (e) {
    responseError();
  }
};

export default handler;
