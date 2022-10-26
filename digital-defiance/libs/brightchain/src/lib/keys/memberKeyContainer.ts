import AsymmetricKeyFragment from "./asymmetricKeyFragment";
import KeyFragmentType from "./keyFragmentType";
import KeyRole from "./keyRole";
import KeyType from "./keyType";

export default class MemberKeyContainer {
    public readonly keyRole: KeyRole;
    public readonly keyType: KeyType;
    public readonly keyFragments: Map<KeyFragmentType, AsymmetricKeyFragment>;
    constructor(keyRole: KeyRole, keyType: KeyType, keyFragments: Map<KeyFragmentType, AsymmetricKeyFragment>) {
        this.keyRole = keyRole;
        this.keyType = keyType;
        this.keyFragments = keyFragments;
    }
}