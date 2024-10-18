import Array "mo:base/Array";
import Text "mo:base/Text";
import Bool "mo:base/Bool";

module {
    // utils
    public func array_unique(arr: [Text]) : [Text] {
        var uniqueArr: [Text] = [];

        for(item in arr.vals()) {
            if (not array_include(uniqueArr, item)) {
                uniqueArr := Array.append(uniqueArr, [item]);
            }
        };

        return uniqueArr;
    };

    public func array_include(arr: [Text], item: Text) : Bool {
        for(val in arr.vals()) {
            if (val == item) return true;
        };
        return false;
    };
}