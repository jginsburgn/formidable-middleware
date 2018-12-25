import { Handler, NextFunction, Request, Response } from "express";
import { File as FormidableFile, IncomingForm } from "formidable";
import fs, { WriteStream } from "fs";

interface Field {
  name: string;
  value: string;
}

interface File {
  name: string;
  file: FormidableFile;
}

interface FormidableMiddlewareRequest extends Request {
  body: {
    fields: Field[],
    files: File[],
  };
}

/**
 * Formidable middleware proxy factory. The middleware will populate req.body.fields with an array of objects of the nature { name: string, value: string } corresponding to the fields of the incoming multipart/form-data. The middleware will populate req.body.files with an array of objects of the nature { name: string, file: File } corresponding to files incoming in the multipart/form-data request. The middleware will throw an error upon being unable to parse the multipart/form-data request.
 * @param options An object containing settings to transfer as-is to the formidable form.
 */
function FormidableMiddleware(options?: any): Handler {
  const middleware: Handler = ((req: Request, res: Response, next: NextFunction): any => {

    const form: IncomingForm = new IncomingForm();

    Object.assign(form, options);

    const files: Array<{ name: string, file: FormidableFile }> = [];
    const fields: Array<{ name: string, value: string }> = [];

    let error: any = undefined;

    form.on("file", function (name: string, file: FormidableFile): void {
      try {
        files.push({ name, file });
      }
      catch (err) {
        ((file as any)._writeStream as WriteStream).on("close", function (): void {
          fs.unlinkSync(file.path);
        });
        error = err;
      }
    });

    form.on("field", function (name: string, value: string): void {
      fields.push({ name, value });
    });

    form.on("error", function (err: any): void {
      for (const file of files) {
        fs.unlinkSync(file.file.path);
      }
      next(err);
    });

    form.on("end", function (): void {
      if (error) {
        next(error);
        return;
      }
      req.body = {
        fields,
        files,
      };
      next();
    });

    form.parse(req);
    return;
  }).bind(undefined);
  return middleware;
}

export { FormidableMiddleware, FormidableMiddlewareRequest };