import type { ResourceGetterOptions } from "./ResourceStore";
import type { Container } from "./resource/Container";
import type { Leaf } from "./resource/Leaf";
import type { ContainerUri, LeafUri } from "./util/uriTypes";

export interface ISolidLdoDataset {
  getResource(uri: ContainerUri, options?: ResourceGetterOptions): Container;
  getResource(uri: LeafUri, options?: ResourceGetterOptions): Leaf;
  getResource(uri: string, options?: ResourceGetterOptions): Leaf | Container;
  getResource(uri: string, options?: ResourceGetterOptions): Leaf | Container;
}
