import { DataResult } from "../requestResults/DataResult";
import type { TurtleFormattingError } from "../requestResults/DataResult";
import {
  HttpErrorResult,
  ServerHttpError,
  type HttpErrorResultType,
} from "../requestResults/HttpErrorResult";
import { UnexpectedError } from "../requestResults/ErrorResult";
import { AbsentResult } from "../requestResults/AbsentResult";
import { BinaryResult } from "../requestResults/BinaryResult";
import {
  addRawTurtleToDataset,
  addResourceRdfToContainer,
} from "../../util/rdfUtils";
import type { RequestParams } from "./requestParams";

export type ReadResult =
  | AbsentResult
  | DataResult
  | BinaryResult
  | ReadResultError;
export type ReadResultError =
  | HttpErrorResultType
  | TurtleFormattingError
  | UnexpectedError;

export async function readResource({
  uri,
  fetch,
  transaction,
}: RequestParams): Promise<ReadResult> {
  try {
    // Fetch options to determine the document type
    const response = await fetch(uri);
    if (AbsentResult.is(response)) {
      return new AbsentResult(uri);
    }
    const httpErrorResult = HttpErrorResult.checkResponse(uri, response);
    if (httpErrorResult) return httpErrorResult;

    // Add this resource to the container
    addResourceRdfToContainer(uri, transaction);

    if (DataResult.is(response)) {
      // Parse Turtle
      const rawTurtle = await response.text();
      return addRawTurtleToDataset(rawTurtle, transaction, uri);
    } else {
      // Load Blob
      const contentType = response.headers.get("content-type");
      if (!contentType) {
        return new ServerHttpError(
          uri,
          response,
          "Server provided no content-type",
        );
      }
      const blob = await response.blob();
      return new BinaryResult(uri, blob, contentType);
    }
  } catch (err) {
    return UnexpectedError.fromThrown(uri, err);
  }
}
