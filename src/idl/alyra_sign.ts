export type AlyraSign = {
  "version": "0.1.0",
  "name": "alyrasign",
  "instructions": [
    {
      "name": "createFormation",
      "accounts": [
        {
          "name": "formation",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "createSession",
      "accounts": [
        {
          "name": "session",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "formation",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "date",
          "type": "i64"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "registerPresence",
      "accounts": [
        {
          "name": "presence",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "session",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "student",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "timestamp",
          "type": "i64"
        }
      ]
    },
    {
      "name": "validatePresence",
      "accounts": [
        {
          "name": "presence",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "session",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Formation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "Session",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "formation",
            "type": "publicKey"
          },
          {
            "name": "date",
            "type": "i64"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "authority",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "Presence",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "session",
            "type": "publicKey"
          },
          {
            "name": "student",
            "type": "publicKey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "isValidated",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "UnauthorizedValidation",
      "msg": "Seul l'autorité de la session peut valider les présences"
    }
  ],
  "metadata": {
    "address": "5efYRoL5mJVBmnJCwTtEmtErLyMSAjjh3BW3ra2quKCP"
  }
};

export const IDL: AlyraSign = {
  "version": "0.1.0",
  "name": "alyrasign",
  "instructions": [
    {
      "name": "createFormation",
      "accounts": [
        {
          "name": "formation",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "createSession",
      "accounts": [
        {
          "name": "session",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "formation",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "date",
          "type": "i64"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "registerPresence",
      "accounts": [
        {
          "name": "presence",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "session",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "student",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "timestamp",
          "type": "i64"
        }
      ]
    },
    {
      "name": "validatePresence",
      "accounts": [
        {
          "name": "presence",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "session",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Formation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "Session",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "formation",
            "type": "publicKey"
          },
          {
            "name": "date",
            "type": "i64"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "authority",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "Presence",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "session",
            "type": "publicKey"
          },
          {
            "name": "student",
            "type": "publicKey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "isValidated",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "UnauthorizedValidation",
      "msg": "Seul l'autorité de la session peut valider les présences"
    }
  ],
  "metadata": {
    "address": "5efYRoL5mJVBmnJCwTtEmtErLyMSAjjh3BW3ra2quKCP"
  }
};