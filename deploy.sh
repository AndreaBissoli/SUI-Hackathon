PACKAGE="0xb4619bfef5091b16415bab0c8c36c7325653ef66500e5ffd825899b0eb9c89fa"
REGISTRY="0x72c6d9cb11a9b9fe00d657bfdeca82cc20763c956df1efda5881b38ab64f2efc"

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