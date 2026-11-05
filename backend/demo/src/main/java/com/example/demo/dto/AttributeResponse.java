package com.example.demo.dto;

import java.util.List;

public record AttributeResponse(Integer id, String name, String description, List<SubAttributeResponse> subAttributes) {

}
