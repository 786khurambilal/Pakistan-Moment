# Leader Portraits

Leader images can be attached to prompts when their filename matches the scene `refKey`, but the
default cap is `MAX_LEADER_REFERENCES=1` for stable guest identity.

The generation flow sends:

- Image 1: guest selfie
- Image 2: Quaid-e-Azam reference portrait by default

Increasing `MAX_LEADER_REFERENCES` may add more leaders, but it can cause the model to paste
reference portraits or drop the guest.
