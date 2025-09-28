PACKAGE="0xb5fd1f9539b10a459627c54f056a24e2ba9110fb961d415628cdcd533bbcfb9d"
REGISTRY="0x4d43d5f392296606eee92a4ddeca11d61ec38b8335e045ec4b1001438db90ccf"

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


sui client call \
  --package $PACKAGE \
  --module edu_defi \
  --function investor_propose_contract \
  --args \
    0x13f3d66ff9b6c227da7e13501114b3508b838939017516760678948384c79040 \
    "contract_pdf_hash" \
    100000000000 \
    30 \
    20 \
    24 \
    $REGISTRY \
    0x6 \
  --gas-budget 100000000