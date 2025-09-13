import { SetMetadata } from "@nestjs/common";

export const Objectcode = (...objectcode: string[]) =>
  SetMetadata("objectcode", objectcode);