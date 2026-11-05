package com.example.demo.controllers;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.AttributeResponse;
import com.example.demo.dto.SubAttributeResponse;
import com.example.demo.entities.Attribute;
import com.example.demo.repositories.AttributeRepository;
import com.example.demo.repositories.SubAttributeRepository;


@RestController
@RequestMapping("/attributes")
public class AttributeController {

    private final AttributeRepository attributeRepository;
    private final SubAttributeRepository subAttributeRepository;

    public AttributeController(AttributeRepository attributeRepository, SubAttributeRepository subAttributeRepository) {
        this.attributeRepository = attributeRepository;
        this.subAttributeRepository = subAttributeRepository;
    }

    // Full catalog, each attribute with its sub-attributes nested inside.
    // Two queries total: sub-attributes are fetched once and grouped here
    // instead of being looked up per attribute. Attributes load first so each
    // sub-attribute's parent is already in the persistence context.
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<AttributeResponse>> getAttributes() {
        List<Attribute> attributes = attributeRepository.findAllByOrderByDisplayOrderAsc();

        Map<Integer, List<SubAttributeResponse>> subAttributesByAttribute =
            subAttributeRepository.findAllByOrderByDisplayOrderAsc().stream()
                .collect(Collectors.groupingBy(
                    sub -> sub.getAttribute().getId(),
                    Collectors.mapping(
                        sub -> new SubAttributeResponse(sub.getId(), sub.getName()),
                        Collectors.toList()
                    )
                ));

        List<AttributeResponse> catalog = attributes.stream()
            .map(attribute -> new AttributeResponse(
                attribute.getId(),
                attribute.getName(),
                attribute.getDescription(),
                subAttributesByAttribute.getOrDefault(attribute.getId(), List.of())
            ))
            .toList();

        return ResponseEntity.ok(catalog);
    }
}
