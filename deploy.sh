PACKAGE="0xa1d5e04561b99007764efa7cf83bee82c9be75a2d925d13d4cae2475b71ed180"
REGISTRY="0x2a6e5acb21b5181fb1b617cc990095aa256387334551f7c8b3cf45d32fc5bd3d"

# CREATE INVESTORS

sui client call \
  --package $PACKAGE \
  --module edu_defi \
  --function investor_create_profile \
  --args \
    "Andrea" \
    "Bissoli" \
    35 \
    "investor_img_url" \
    $REGISTRY \
    0x06 \
  --gas-budget 10000000

sui client call \
  --package $PACKAGE \
  --module edu_defi \
  --function investor_create_profile \
  --args \
    "Lorenzo" \
    "Moni" \
    35 \
    "investor_img_url" \
    $REGISTRY \
    0x06 \
  --gas-budget 10000000

sui client call \
  --package $PACKAGE \
  --module edu_defi \
  --function investor_create_profile \
  --args \
    "Alessandro" \
    "Bombarda" \
    35 \
    "investor_img_url" \
    $REGISTRY \
    0x06 \
  --gas-budget 10000000


# CREATE STUDENTS

sui client call \
  --package $PACKAGE \
  --module edu_defi \
  --function student_create_profile \
  --args \
    "Filippo" \
    "Viacala" \
    25 \
    "cv_hash_123" \
    "profile_img_url" \
    100000 \
    20 \
    24 \
    $REGISTRY \
    0x06 \
  --gas-budget 10000000


sui client call \
    --package $PACKAGE \
    --module edu_defi \
    --function student_create_profile \
    --args \
    "Francesco" \
    "Pianola" \
    25 \
    "cv_hash_123" \
    "profile_img_url" \
    100000 \
    20 \
    24 \
    $REGISTRY \
    0x06 \
    --gas-budget 10000000